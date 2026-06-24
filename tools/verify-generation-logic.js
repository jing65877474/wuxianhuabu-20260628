const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const smartCanvasPath = path.join(root, "static", "js", "smart-canvas.js");
const source = fs.readFileSync(smartCanvasPath, "utf8");
const backendSource = fs.readFileSync(path.join(root, "main.py"), "utf8");

function check(condition, message) {
    if (!condition) throw new Error(message);
}

function includesAll(values, message) {
    check(values.every((value) => source.includes(value)), message);
}

function functionSource(name) {
    const marker = `function ${name}(`;
    const start = source.indexOf(marker);
    check(start >= 0, `${name} was not found.`);
    const bodyStart = source.indexOf("{", start);
    let depth = 0;
    for (let index = bodyStart; index < source.length; index += 1) {
        if (source[index] === "{") depth += 1;
        if (source[index] === "}") depth -= 1;
        if (depth === 0) return source.slice(start, index + 1);
    }
    throw new Error(`${name} is incomplete.`);
}

includesAll([
    "Person similarity: very low.",
    "Person similarity: low.",
    "Person similarity: medium.",
    "Person similarity: high.",
    "model identity",
    "subject identity",
    "same person",
    "same model",
    "UPLOADED IMAGE ROLE MAP:",
    "MANDATORY PRODUCT-HAND INTERACTION:",
    "referenceWeight:100",
    "filterStaleEmptyRunPlaceholders",
    "meta.sourceNodeId !== targetNode.id",
    "cleanupCaseStyleReferenceInputs",
], "A required generation safeguard is missing.");

check(
    /function styleCasePreviewReference\(cases\)\s*\{\s*return null;\s*\}/.test(source),
    "Style matching must not create a case-image reference."
);

const styleUpload = new Function(
    "smartReferenceRoleIsProduct",
    "smartReferenceRoleIsCase",
    "smartReferenceLikelyContainsPerson",
    `${functionSource("smartStyleReferenceShouldUpload")}; return smartStyleReferenceShouldUpload;`
)(
    (ref) => ref?.role === "product_truth_reference" || ref?.role === "product_detail_reference",
    (ref) => ref?.role === "case_style_reference",
    (node, ref) => ref?.containsPerson === true
);

const personReference = { role: "composition_reference", containsPerson: true };
check(styleUpload({}, personReference, 65) === false, "A normal person reference below 85 must remain text-only.");
check(styleUpload({}, personReference, 85) === true, "A normal person reference at 85 must upload.");
check(styleUpload({}, { role: "product_truth_reference" }, 20) === true, "Product truth must upload at every style weight.");

var uniqueReferenceImages = (refs) => {
    const seen = new Set();
    return (refs || []).filter((ref) => ref && ref.url && !seen.has(ref.url) && seen.add(ref.url));
};
var imageRefsOnly = (refs) => (refs || []).filter((ref) => ref && ref.url && (ref.kind || "image") === "image");
var promptNodeReferenceWeight = (node) => Number(node?.referenceWeight ?? 65);
var smartStyleReferenceShouldUpload = () => false;

const referenceStart = source.indexOf("function smartReferenceRoleIsCase(");
const referenceEnd = source.indexOf("function smartNormalizeProductReferenceText(", referenceStart);
check(referenceStart >= 0 && referenceEnd > referenceStart, "Reference routing functions were not found.");
eval(source.slice(referenceStart, referenceEnd));

const primary = { url: "primary.png", kind: "image", role: "composition_reference", name: "portrait person reference" };
const product = { url: "product.png", kind: "image", role: "product_truth_reference", productTruthExplicit: true };
const caseRef = {
    url: "case.png",
    kind: "image",
    role: "case_style_reference",
    styleCaseWeak: true,
    textOnlyReference: true,
    uploadReference: false,
};

function route(refs, weight = 65) {
    const node = { referenceWeight: weight };
    const prioritized = smartPrioritizeGenerationReferences(refs);
    const decorated = smartDecorateReferenceWeights(node, prioritized);
    return decorated.filter(smartReferenceUploadAllowed);
}

const mediumPersonWithCase = route([primary, caseRef], 65);
check(mediumPersonWithCase.length === 0, "A 65-weight person reference and its case image must both remain text-only.");

const highPersonWithCase = route([primary, caseRef], 85);
check(highPersonWithCase.length === 1, "At 85+, only the original person/style reference may upload.");
check(highPersonWithCase[0].role === "composition_reference", "A case image must never replace the original high-weight reference.");
check(!highPersonWithCase.some((ref) => ref.role === "case_style_reference"), "Case references must never upload.");

const productFlow = route([primary, product, caseRef], 65);
check(productFlow.some((ref) => ref.role === "product_truth_reference"), "Product truth reference must upload.");
check(!productFlow.some((ref) => ref.role === "case_style_reference"), "Case reference must not upload when product truth exists.");

check(smartPersonSimilarityInstruction(20).includes("very low"), "0-34 person tier changed.");
check(smartPersonSimilarityInstruction(45).includes("low"), "35-59 person tier changed.");
check(smartPersonSimilarityInstruction(65).includes("medium"), "60-84 person tier changed.");
check(smartPersonSimilarityInstruction(90).includes("high"), "85+ person tier changed.");

check(
    backendSource.includes('and image_reference_role(ref) != "case_style_reference"') &&
        !backendSource.includes("matchedCasePair: bool"),
    "Backend must reject every case-style image reference."
);
check(
    backendSource.includes("return 1024 if weight >= 85 else 768"),
    "Style-reference compression must use 768 below 85 and 1024 at 85+."
);
check(
    backendSource.includes('return 1536') &&
        backendSource.includes('role in {"product_truth_reference", "product_detail_reference", "mask"}'),
    "Product-reference compression must remain at 1536."
);
check(
    backendSource.includes('tempfile.mkstemp(prefix="sized_ref_"') &&
        backendSource.includes("temp_paths.append(temp_path)"),
    "Multipart reference resizing must use temporary copies."
);

console.log("generation-logic verification: OK");
