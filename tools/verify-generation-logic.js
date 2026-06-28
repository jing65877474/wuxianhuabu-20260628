const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const smartCanvasPath = path.join(root, "static", "js", "smart-canvas.js");
const source = fs.readFileSync(smartCanvasPath, "utf8");
const smartCanvasCss = fs.readFileSync(path.join(root, "static", "css", "smart-canvas.css"), "utf8");
const backendSource = fs.readFileSync(path.join(root, "main.py"), "utf8");
const canvasSource = fs.readFileSync(path.join(root, "static", "js", "canvas.js"), "utf8");
const canvasListSource = fs.readFileSync(path.join(root, "static", "js", "canvas-list.js"), "utf8");
const smartCanvasHtml = fs.readFileSync(path.join(root, "static", "smart-canvas.html"), "utf8");

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
    "very low reference strength.",
    "0/100 zero person-reference strength.",
    "ZERO PERSON REFERENCE LOCK:",
    "PARTIAL HUMAN REFERENCE LOCK:",
    "NO FULL HUMAN SUBJECT LOCK:",
    "PERSON VISUAL UPLOAD LOCK:",
    "weakest-reference mode",
    "weak visual-family anchor",
    "containsPartialHumanOnly",
    "low reference strength. Generate a clearly different person.",
    "medium reference strength. Because the value is below 90",
    "exact identity mode. This is the only reference-strength value",
    "Do not change this rule without the",
    "model identity",
    "subject identity",
    "same person",
    "same model",
    "smartTextExplicitlyRequestsSamePerson",
    "UPLOADED IMAGE ROLE MAP:",
    "MANDATORY PRODUCT-HAND INTERACTION:",
    "CAMERA-LOCKED VARIANT:",
    "LATEST BACKGROUND/PALETTE OVERRIDE:",
    "referenceWeight:100",
    "generated-prompt-mode",
    "runGeneratedImagePromptRematch",
    "generatedEditBaseReferenceWeight",
    "generated-edit-base-weight-range",
    "reference_weight:editBaseWeight",
    "SMART_POSTER_COPY_PROMPT_BUDGET",
    "smartPosterCopyEnabledInRequest",
    "poster_copy_enabled:node.posterCopyEnabled === true",
    "posterCopyReference:Boolean(img.posterCopyReference)",
    "BRAND IDENTITY LOCK:",
    "smartBrandIdentityPrompt",
    "gpt_image_reference_limit",
    "smartGenerationReferenceLimit",
    "POSTER COPY LOCK:",
    "POSTER COPY OFF / PRODUCT LABELS ON:",
    "poster_copy_off_layout_reference",
    "Poster-copy disabled does not reduce visual similarity",
    "poster_copy_text_lock_balanced_visual",
    "Use this as a text-reading reference",
    "lightweight text guide",
    "Prefer a timely completed generation",
    "Poster-copy text/layout lock",
    "copy the reference layout and design system",
    "product-surface brand marks",
    "authentic product-surface labels",
    "BALANCED EDIT-BASE REFERENCE:",
    "LOOSE EDIT-BASE REFERENCE:",
    "generatedEditBase:true",
    "structureLock:true",
    "generated-rematch-note",
    "filterStaleEmptyRunPlaceholders",
    "meta.sourceNodeId !== targetNode.id",
    "cleanupCaseStyleReferenceInputs",
    "smartBuildGenerationTrace",
    "confirmSmartGenerationPreflight",
    "smartGenerationPreflightOpen",
    "run?.trace || null",
], "A required generation safeguard is missing.");

check(
    source.includes("const confirmed = await confirmSmartGenerationPreflight(trace)") &&
        source.includes("if(!confirmed)") &&
        source.includes("createFrozenGenerationRequest({node, request:{...request, prompt, refs}, runSettings:settings, kind:logKind})") &&
        source.includes("smartSnapshotRunMetaFromCompiled(compiledRequest, node.id, trace)"),
    "Generation must show a frozen preflight request preview and stop cleanly when the user cancels."
);
const runGenerationSource = functionSource("runGeneration");
check(
    (runGenerationSource.match(/buildPromptRequest\(/g) || []).length === 1 &&
        !runGenerationSource.includes("buildPromptRequest(node, null, true") &&
        runGenerationSource.includes("runApiGeneration(compiledRequest)") &&
        runGenerationSource.includes("compiledSettings") &&
        runGenerationSource.includes("frozenRefs") &&
        runGenerationSource.includes("consumeGenerationDefaultsAfterTaskCreated(compiledRequest"),
    "A confirmed generation must submit the frozen compiledRequest without rebuilding or consuming defaults before task creation."
);
check(
    source.includes("function smartReferenceRoleLabel") &&
        source.includes("smartReferenceUploadStateLabel") &&
        smartCanvasCss.includes(".input-thumb[data-ref-role=\"product_truth_reference\"]::before") &&
        smartCanvasCss.includes(".smart-node-role-badge"),
    "Reference role badges must remain visible on composer and node thumbnails."
);
check(
    source.includes("trace:run?.trace || null") &&
        source.includes("smartTraceSummary(trace)") &&
        smartCanvasCss.includes(".log-trace"),
    "Generation trace metadata must be saved and shown in the generation log."
);

check(
    source.includes("image:editBase.url") &&
        source.includes("current_prompt:currentPrompt") &&
        source.includes("camera_control:cameraControl") &&
        source.includes("poster_copy_enabled:node.posterCopyEnabled === true") &&
        source.includes("node.text = prompt"),
    "Generated-image prompt rematching must use the current image, preserve camera control, and replace the current prompt."
);
check(
    smartCanvasHtml.includes("composerPromptMatchBtn") &&
        source.includes("matchComposerPromptFromText") &&
        source.includes("current_prompt:userRequest") &&
        source.includes("user_request:userRequest") &&
        backendSource.includes('"search_query": text_seed[:800] or "commercial advertising image"'),
    "Empty-node text prompt matching must expose a composer button and use the user's text as the style-library seed."
);
const filterTransientUploads = new Function(
    "isTransientUploadPlaceholderNode",
    `${functionSource("filterTransientUploadPlaceholders")}; return filterTransientUploadPlaceholders;`
)((node) => node?.empty === true);
const connectedEmptyUpload = filterTransientUploads(
    [
        {id:"source", empty:false},
        {id:"linked-empty", empty:true},
        {id:"legacy-linked-empty", empty:true, inputNodeIds:["source"]},
        {id:"orphan-empty", empty:true}
    ],
    [{from:"source", to:"linked-empty", kind:"input"}]
);
check(
    connectedEmptyUpload.nodes.some((node) => node.id === "linked-empty") &&
        connectedEmptyUpload.nodes.some((node) => node.id === "legacy-linked-empty") &&
        connectedEmptyUpload.connections.some((conn) => conn.to === "linked-empty"),
    "An empty upload node with a real input connection must be preserved."
);
check(
    !connectedEmptyUpload.nodes.some((node) => node.id === "orphan-empty"),
    "A truly orphaned empty upload placeholder should still be cleaned."
);
check(
    source.includes('class="generated-edit-base-weight-range" type="range" min="0" max="100" step="5"') &&
        !source.includes('min="100" max="100" value="100" disabled'),
    "Generated-image edit-base weight must default to 100 but remain manually adjustable."
);
includesAll([
    "function smartTextExplicitlyRequestsSamePerson",
    "function smartZeroPersonReferenceLockPrompt",
    "0/100 zero person-reference strength.",
    "ZERO PERSON REFERENCE LOCK:",
    "exact identity mode. This is the only reference-strength value",
    "MUST NOT be the same reference person",
    "different hairline, and clearly different hairstyle"
]);
check(
    canvasListSource.includes("smart-canvas.html?id=${enc}&project=${project}&v=${Date.now()}"),
    "Opening a smart canvas must cache-bust its HTML so the generated-image prompt card cannot remain stale."
);

check(
    /function styleCasePreviewReference\(cases\)\s*\{\s*return null;\s*\}/.test(source),
    "Style matching must not create a case-image reference."
);

var smartReferenceHasStyleRole = (ref) => {
    const roles = [...new Set([...(Array.isArray(ref?.roles) ? ref.roles : []), ref?.role, ref?.autoRole, ref?.userRole].filter(Boolean))];
    return roles.some((role) => ["composition_reference", "primary_style_reference", "primary_reference"].includes(role));
};

const styleUpload = new Function(
    "smartReferenceRoleIsProduct",
    "smartReferenceRoleIsCase",
    "smartReferenceHasStyleRole",
    "smartReferenceLikelyContainsPerson",
    "smartPromptExplicitlyRequestsSamePerson",
    "smartPosterCopyEnabledForGeneration",
    "smartPosterCopyDisabledForGeneration",
    `${functionSource("smartStyleReferenceShouldUpload")}; return smartStyleReferenceShouldUpload;`
)(
    (ref) => ref?.role === "product_truth_reference" || ref?.role === "product_detail_reference",
    (ref) => ref?.role === "case_style_reference",
    smartReferenceHasStyleRole,
    (node, ref) => ref?.containsPerson === true,
    (node) => node?.samePerson === true,
    (node) => node?.posterCopyEnabled === true,
    (node) => node?.posterCopyDisabled === true
);

const personReference = { role: "composition_reference", containsPerson: true };
check(styleUpload({}, personReference, 0) === true, "A zero-strength main person/style reference must still upload; prompt strength controls similarity.");
check(styleUpload({ posterCopyEnabled: true }, personReference, 0) === true, "Poster-copy must not disable a zero-strength main person/style reference upload.");
check(styleUpload({ posterCopyDisabled: true }, personReference, 0) === true, "Poster-copy disabled must not disable a zero-strength main person/style reference upload.");
check(styleUpload({}, personReference, 20) === true, "A 1-34 main person/style reference must upload while prompt forces a new unrelated person.");
check(styleUpload({}, personReference, 65) === true, "A 60-89 main person/style reference must upload while prompt forbids the same person.");
check(styleUpload({ posterCopyEnabled: true }, personReference, 65) === true, "Poster-copy must keep the main person/style reference uploaded at sub-90 strength.");
check(styleUpload({ posterCopyDisabled: true }, personReference, 65) === true, "Poster-copy disabled must keep the main person/style reference uploaded at sub-90 strength.");
check(styleUpload({}, personReference, 85) === true, "A normal person/style reference at 85 must upload while prompt controls identity similarity.");
check(styleUpload({}, personReference, 90) === true, "A 90-99 person reference uploads for near-reference style while prompt still forbids exact identity.");
check(styleUpload({}, personReference, 100) === true, "100 person reference uploads and is the only exact identity mode.");
check(styleUpload({}, { role: "product_truth_reference" }, 20) === true, "Product truth must upload at every style weight.");
const nonPersonReference = { role: "composition_reference" };
check(styleUpload({}, nonPersonReference, 0) === true, "A zero-strength main non-human reference must still upload; prompt strength controls similarity.");
check(styleUpload({}, nonPersonReference, 35) === true, "A low-strength main non-human reference must upload.");
check(styleUpload({}, nonPersonReference, 65) === true, "A medium-strength main non-human reference must upload.");
check(styleUpload({}, nonPersonReference, 90) === true, "A high-strength main non-human reference must upload.");
check(styleUpload({}, nonPersonReference, 100) === true, "A 100-strength main non-human reference must upload.");

var uniqueReferenceImages = (refs) => {
    const seen = new Set();
    return (refs || []).filter((ref) => ref && ref.url && !seen.has(ref.url) && seen.add(ref.url));
};
var imageRefsOnly = (refs) => (refs || []).filter((ref) => ref && ref.url && (ref.kind || "image") === "image");
var promptNodeReferenceWeight = (node) => Number(node?.referenceWeight ?? 65);
var smartStyleReferenceShouldUpload = () => false;
var smartPromptExplicitlyRequestsSamePerson = (node) => node?.samePerson === true;
var smartPromptAllowsHumanByIntent = (node) => node?.allowHuman === true;
var smartStyleMatchLikelyContainsPerson = (node) => node?.stylePerson === true;
var inputNodesFor = () => [];
var isSmartGroupNode = () => false;
var isGeneratedImagePromptComposerNode = (node) => node?.type === "smart-image" && node?.generatedPromptInitialized === true;
var generatedEditBaseSimilarityIntent = () => "balanced_edit_base";
var isApiLikeEngine = (engine) => engine === "api";
var settings = { engine: "api" };
var smartProviderPromptBudget = () => ({ maxReferenceImages: 5 });
var smartReferenceLimitForRun = (prompt, refs) => imageRefsOnly(refs).length;
var smartCreativeVariantRequested = () => false;
var smartCameraControlRequested = () => false;
var smartCreativeReferenceImages = (refs) => refs || [];
var SMART_REFERENCE_IMAGE_MAX = 8;
var smartAspectRecomposeReferences = () => [];

const referenceStart = source.indexOf("function uniqueReferenceImages(");
const referenceEnd = source.indexOf("function smartNormalizeProductReferenceText(", referenceStart);
check(referenceStart >= 0 && referenceEnd > referenceStart, "Reference routing functions were not found.");
eval(source.slice(referenceStart, referenceEnd));

eval([
    "smartClampReferenceSimilarity",
    "smartNodeUiReferenceSimilarityValue",
    "smartReferenceObjectSimilarityValue",
    "smartResolveEffectiveReferenceSimilarity",
    "smartNormalizeReferenceSimilarityState",
    "smartReferenceSimilarityValue",
    "smartSimilarityRemovedUnique",
    "smartStripStaleReferenceSimilarityStatements",
    "smartNormalizeCurrentReferenceSimilarityStatements",
].map(functionSource).join("\n"));

const uploadPromptStart = source.indexOf("function smartReferenceDisplayLabel(");
const uploadPromptEnd = source.indexOf("function smartMechanicalStructureIntentText(", uploadPromptStart);
check(uploadPromptStart >= 0 && uploadPromptEnd > uploadPromptStart, "Final upload prompt mapping functions were not found.");
eval(source.slice(uploadPromptStart, uploadPromptEnd));

const staleSimilarityText = [
    "Original reference similarity: 15/100. Old upstream lock.",
    "保持相似的布光和背景色",
    "Reference similarity: 60/100. Old case-library control.",
    "产品外观与参考图高度一致",
    "Person similarity: low. Old person-control line.",
].join("\n");
const staleSimilarityClean = smartStripStaleReferenceSimilarityStatements(staleSimilarityText);
check(
    !/Original reference similarity|Reference similarity:\s*60\/100|Person similarity:\s*low|15\/100|60\/100/.test(staleSimilarityClean.text),
    "Stale numeric reference/person similarity controls must be removed before final prompt assembly."
);
check(
    staleSimilarityClean.text.includes("保持相似的布光和背景色") &&
        staleSimilarityClean.text.includes("产品外观与参考图高度一致"),
    "Natural-language similarity requirements must not be removed by stale-control cleanup."
);
const currentSimilarityState = {
    effectiveReferenceSimilarity:65,
    similaritySource:"current_node_ui",
    similarityAppliedToUploadDecision:true,
    similarityPromptEmitted:true
};
const currentSimilarityPrompt = [
    "Style/reference similarity setting: 65/100 (balanced style guidance with clear new-shot variation). Use style references for mood.",
    "Person similarity: medium does NOT mean same identity. Generate a different model/person."
].join(" ");
const conflictingFinalPrompt = [
    "UPLOADED IMAGE ROLE MAP:\nImage 1: uploaded style/composition reference (style.png).",
    currentSimilarityPrompt,
    "Original reference similarity: 15/100. Old upstream lock.",
    "Style/reference similarity setting: 60/100. Old style lock.",
    "保持相似的布光和背景色",
].join("\n\n");
const normalizedSimilarityPrompt = smartNormalizeCurrentReferenceSimilarityStatements(conflictingFinalPrompt, currentSimilarityState);
const currentStyleStatements = normalizedSimilarityPrompt.text.match(/Style\/reference similarity setting:\s*\d+\s*\/\s*100/gi) || [];
check(
    currentStyleStatements.length === 1 && /65\s*\/\s*100/.test(currentStyleStatements[0]),
    "Final prompt must keep exactly one current Style/reference similarity setting."
);
check(
    !normalizedSimilarityPrompt.text.includes("Original reference similarity") &&
        !normalizedSimilarityPrompt.text.includes("15/100") &&
        !normalizedSimilarityPrompt.text.includes("60/100"),
    "Final prompt must not retain stale Original/Style reference similarity values."
);
check(
    normalizedSimilarityPrompt.text.includes("保持相似的布光和背景色"),
    "Final similarity cleanup must preserve ordinary natural-language visual similarity."
);

const applyPromptNodeReferenceRoles = new Function(
    "uniqueReferenceImages",
    "imageRefsOnly",
    "smartNodeRequestsProductTruth",
    "promptNodeReferenceWeight",
    "mediaKindForItem",
    "smartReferenceHasStyleRole",
    `${functionSource("promptNodeApplyCurrentReferenceRoles")}; return promptNodeApplyCurrentReferenceRoles;`
)(
    uniqueReferenceImages,
    imageRefsOnly,
    (node) => node?.wantsProductTruth === true,
    (node) => Number(node?.styleMatch?.referenceWeight ?? node?.referenceWeight ?? 65),
    (img) => img?.kind || "image",
    smartReferenceHasStyleRole
);
const promptSliderRefs = applyPromptNodeReferenceRoles(
    { id: "prompt-slider", type: "smart-prompt", styleMatch: { referenceWeight: 100 }, referenceWeight: 100 },
    [{ url: "style.png", kind: "image", name: "style input" }]
);
check(
    promptSliderRefs[0].role === "primary_style_reference" &&
        promptSliderRefs[0].referenceWeight === 100 &&
        promptSliderRefs[0].styleReferenceWeight === 100,
    "A live Prompt-node reference slider must stamp its current value onto the style reference passed downstream."
);
check(
    smartResolveEffectiveReferenceSimilarity({ id: "downstream-image" }, promptSliderRefs).effectiveReferenceSimilarity === 100,
    "Downstream generation preflight must inherit the upstream Prompt-node slider value instead of falling back to 65."
);
const productTruthSingleRef = applyPromptNodeReferenceRoles(
    { id: "product-prompt", type: "smart-prompt", styleMatch: { referenceWeight: 20 }, referenceWeight: 20, wantsProductTruth: true },
    [{ url: "product.png", kind: "image", name: "product input" }]
);
check(
    !productTruthSingleRef[0].referenceWeight && !productTruthSingleRef[0].styleReferenceWeight,
    "A product-truth Prompt node with one product image must not be converted into a style reference by the slider sync."
);

const compressionStart = source.indexOf("function smartNormalizePromptText(");
const compressionEnd = source.indexOf("function smartNotifyPromptCompression(", compressionStart);
check(compressionStart >= 0 && compressionEnd > compressionStart, "Prompt compression functions were not found.");
eval(source.slice(compressionStart, compressionEnd));

const productFactsStart = source.indexOf("function defaultSmartProductFacts(");
const productFactsEnd = source.indexOf("function smartProductTruthReferenceSetHash(", productFactsStart);
check(productFactsStart >= 0 && productFactsEnd > productFactsStart, "Product fact summary functions were not found.");
eval(source.slice(productFactsStart, productFactsEnd));

function mappedUploadScenario(refs, uploads) {
    const uploadMap = smartBuildFinalUploadReferenceMap(refs, uploads);
    const mappedRefs = smartApplyFinalUploadReferenceMap(refs, uploadMap);
    const finalUploads = smartFinalUploadedReferences(mappedRefs);
    const prompt = [
        smartUploadedReferenceMapPrompt(mappedRefs, true),
        smartProductTruthRolePrompt(mappedRefs, true),
        smartProductTruthContrastLockPrompt(mappedRefs, true),
        smartBrandIdentityPrompt(mappedRefs),
        smartFinalProductCheckPrompt(mappedRefs, true),
    ].filter(Boolean).join("\n\n");
    return { uploadMap, mappedRefs, finalUploads, prompt };
}

const frontendGuardPrompt = [
    "Product truth references: Image 1 / 图1 (product). These images are strict SKU/product identity references.",
    "PRODUCT TRUTH VS STYLE PRODUCT CONTRAST LOCK: Image 2 / 图2 provides composition guidance only; Image 1 / 图1 is a strict SKU reference.",
    "MECHANICAL STRUCTURE LOCK: Preserve product assembly.",
    "MANDATORY PRODUCT-HAND INTERACTION: The product must be physically held by the model hand.",
    "BRAND IDENTITY LOCK: Preserve visible brand identity marks.",
    "POSTER COPY LOCK: Use Image 2 / 图2 as the authoritative source for readable poster/ad copy.",
    "NO HUMAN SUBJECT LOCK: Do not introduce any person.",
    "Style/reference similarity setting: 65/100.",
    "FINAL PRODUCT CHECK: the hero object must match Image 1 / 图1."
].join("\n\n");
const frontendGuardIds = smartPromptAppliedGuardIds(frontendGuardPrompt);
check(
    [
        "product_identity",
        "product_truth_reference",
        "product_style_contrast",
        "mechanical_structure",
        "product_hand_interaction",
        "brand_identity",
        "poster_copy",
        "human_policy",
        "reference_similarity",
        "final_product_check",
    ].every((guardId) => frontendGuardIds.includes(guardId)),
    "Frontend appliedGuards must record stable ids for the guard rules that are actually present in the prompt."
);
const compressedGuardPrompt = smartCompressPromptToBudget(
    [
        "Product truth references: Image 1 / 图1 (product). These images are strict SKU/product identity references.",
        `BRAND IDENTITY LOCK: ${"Preserve visible brand marks. ".repeat(120)}`,
        "FINAL PRODUCT CHECK: the hero object must match Image 1 / 图1."
    ].join("\n\n"),
    300
).prompt;
check(
    !compressedGuardPrompt.includes("BRAND IDENTITY LOCK:") &&
        !smartPromptAppliedGuardIds(compressedGuardPrompt).includes("brand_identity") &&
        smartPromptAppliedGuardIds(compressedGuardPrompt).includes("product_truth_reference"),
    "Frontend appliedGuards must be recomputed from the compressed final prompt and must not retain guards dropped as whole blocks."
);

const backendGuardDryRun = spawnSync(path.join(root, "python", "python.exe"), ["-c", `
import json
import re
from typing import List, Dict, Any, Optional, Tuple
AIReference = dict
def image_reference_role(ref):
    return str((ref or {}).get("role") or "").strip().lower()
source = open(r'''${path.join(root, "main.py").replace(/\\/g, "\\\\")}''', encoding="utf-8").read()
start = source.index('CANVAS_GUARD_VERSION = "canvas-guard-v1"')
end = source.index('\\ndef canvas_image_task_submit_response', start)
ns = globals()
exec(source[start:end], ns)
guard = ns["canvas_product_truth_prompt_guard"]
refs = [
    {"url":"product.png", "name":"product", "role":"product_truth_reference"},
    {"url":"style.png", "name":"style", "role":"primary_style_reference"},
]
style_only_refs = [{"url":"style.png", "name":"style", "role":"primary_style_reference"}]
full_prompt = "\\n\\n".join([
    "Product truth references: Image 1 / 图1 (product). These images are strict SKU/product identity references.",
    "PRODUCT STRUCTURE PROTECTION: Preserve the exact visible product category, silhouette, proportions.",
    "PRODUCT TRUTH VS STYLE PRODUCT CONTRAST LOCK: Image 2 / 图2 are composition/poster references only; Image 1 / 图1 are strict SKU references.",
    "FINAL PRODUCT CHECK: the hero object must match Image 1 / 图1.",
])
out, diag = guard(full_prompt, refs, "canvas-guard-v1", ["product_identity", "product_truth_reference", "mechanical_structure", "product_style_contrast", "final_product_check"], True)
assert diag["backendAddedGuards"] == [], diag
assert out.count("Product truth references:") == 1 and out.count("PRODUCT TRUTH VS STYLE PRODUCT CONTRAST LOCK:") == 1
partial_prompt = "\\n\\n".join([
    "Product truth references: Image 1 / 图1 (product). These images are strict SKU/product identity references.",
    "PRODUCT STRUCTURE PROTECTION: Preserve the exact visible product category, silhouette, proportions.",
])
out, diag = guard(partial_prompt, refs, "canvas-guard-v1", ["product_identity", "product_truth_reference", "mechanical_structure"], True)
assert diag["backendAddedGuards"] == ["product_style_contrast"], diag
assert out.count("Product truth references:") == 1 and out.count("PRODUCT TRUTH VS STYLE PRODUCT CONTRAST LOCK:") == 1
out, diag = guard("Make a premium scene.", refs, "canvas-guard-v1", [], True)
assert diag["backendAddedGuards"] == ["product_truth_reference", "product_identity", "mechanical_structure", "product_style_contrast"], diag
out, diag = guard("Make a premium scene.", refs, "", [], True)
assert diag["backendAddedGuards"] == ["product_truth_reference", "product_identity", "mechanical_structure", "product_style_contrast"], diag
out, diag = guard("Product truth references: Image 1 / 图1 (product).", refs, "", [], True)
assert diag["backendAddedGuards"] == ["product_style_contrast"], diag
out, diag = guard("Make a premium scene.", refs, "canvas-guard-v1", ["product_truth_reference", "product_identity", "mechanical_structure", "product_style_contrast"], True)
assert diag["backendAddedGuards"] == ["product_truth_reference", "product_identity", "mechanical_structure", "product_style_contrast"], diag
out, diag = guard("Make a premium style image.", style_only_refs, "canvas-guard-v1", [], True)
assert diag["backendAddedGuards"] == [] and out == "Make a premium style image.", diag
print("backend guard dry-run: OK")
`], { encoding: "utf8" });
check(
    backendGuardDryRun.status === 0,
    `Backend guard dry-run failed: ${backendGuardDryRun.stderr || backendGuardDryRun.stdout}`
);

const uploadStyle = {
    url: "style.png",
    name: "style.png",
    kind: "image",
    role: "primary_style_reference",
    sourceNodeId: "style-node",
    sourceImageIndex: 0,
};
const uploadProducts = [1, 2, 3, 4].map((number) => ({
    url: `product-${number}.png`,
    name: `product-${number}.png`,
    kind: "image",
    role: "product_detail_reference",
    sourceNodeId: "product-node",
    sourceImageIndex: number - 1,
}));

const sameImageMultiRoleRefs = [
    { url: "same-image.png?v=1", name: "same style", kind: "image", role: "primary_style_reference", sourceNodeId: "style-a", sourceImageIndex: 0, referenceWeight: 65 },
    { url: "same-image.png?timestamp=2", name: "same composition", kind: "image", role: "composition_reference", sourceNodeId: "style-b", sourceImageIndex: 1, referenceWeight: 65 },
    { url: "same-image.png", name: "same poster", kind: "image", role: "poster_copy_reference", posterCopyReference: true, sourceNodeId: "poster-c", sourceImageIndex: 2, referenceWeight: 65 },
];
const sameImageMultiRoleUploads = smartSelectGenerationReferenceUploads(sameImageMultiRoleRefs, "", { engine: "api" }, "image");
check(sameImageMultiRoleUploads.length === 1, "The same image with multiple roles must upload only once.");
check(
    ["primary_style_reference", "composition_reference", "poster_copy_reference"].every((role) => sameImageMultiRoleUploads[0].roles.includes(role)) &&
        sameImageMultiRoleUploads[0].posterCopyReference === true,
    "Merged same-image uploads must preserve all roles and poster-copy source state."
);
check(
    sameImageMultiRoleUploads[0].sourceNodeIds.includes("style-a") &&
        sameImageMultiRoleUploads[0].sourceNodeIds.includes("style-b") &&
        sameImageMultiRoleUploads[0].sourceNodeIds.includes("poster-c"),
    "Merged same-image uploads must preserve all source node ids."
);

const duplicateNodeRefs = [
    { url: "C:/Assets/ref.png", name: "node A ref", kind: "image", role: "primary_reference", sourceNodeId: "node-a", sourceImageIndex: 0 },
    { url: "C:\\Assets\\ref.png", name: "node B ref", kind: "image", role: "supporting_reference", sourceNodeId: "node-b", sourceImageIndex: 0 },
];
const duplicateNodeUploads = smartSelectGenerationReferenceUploads(duplicateNodeRefs, "", { engine: "api" }, "image");
check(
    duplicateNodeUploads.length === 1 &&
        duplicateNodeUploads[0].sourceNodeIds.includes("node-a") &&
        duplicateNodeUploads[0].sourceNodeIds.includes("node-b"),
    "Different nodes that point to the same normalized local path must upload once and keep both sources."
);

const sameNameDifferentImages = [
    { url: "C:/Assets/a/product.png", name: "product.png", kind: "image", role: "supporting_reference", stableId: "asset-a" },
    { url: "C:/Assets/b/product.png", name: "product.png", kind: "image", role: "supporting_reference", stableId: "asset-b" },
];
check(
    smartSelectGenerationReferenceUploads(sameNameDifferentImages, "", { engine: "api" }, "image").length === 2,
    "Same filename with different path/resource identity must not be merged."
);

const productAndStyleSameImage = [
    { url: "combo.png", name: "combo", kind: "image", role: "primary_style_reference", sourceNodeId: "style-node", referenceWeight: 65 },
    { url: "combo.png?cacheBust=1", name: "combo product", kind: "image", role: "product_detail_reference", sourceNodeId: "product-node", referenceWeight: 100, productTruthExplicit: true },
];
const productStyleResolved = smartResolveFinalReferenceUploads(productAndStyleSameImage, "", { engine: "api" }, "image");
check(
    productStyleResolved.uploadReferences.length === 1 &&
        smartReferenceHasProductRole(productStyleResolved.uploadReferences[0]) &&
        smartReferenceHasStyleRole(productStyleResolved.uploadReferences[0]),
    "One image that is both product and style must upload once while preserving both roles."
);
const productStylePrompt = [
    smartUploadedReferenceMapPrompt(productStyleResolved.references, true),
    smartProductTruthRolePrompt(productStyleResolved.references, true),
    smartProductTruthContrastLockPrompt(productStyleResolved.references, true),
].filter(Boolean).join("\n\n");
check(
    productStylePrompt.includes("Image 1: STRICT PRODUCT SKU + uploaded style/composition reference") &&
        productStylePrompt.includes("Product truth references: Image 1") &&
        !productStylePrompt.includes("Image 2"),
    "Product+style merged prompts must use one Image N while preserving product identity lock."
);

const posterCopyOffProductBrandRefs = smartApplyFinalUploadReferenceMap(
    [
        { url: "brand-b-product.png", name: "Brand B product", kind: "image", role: "product_truth_reference", sourceReferenceId: "brand-b-product" },
        { url: "brand-a-style.png", name: "Brand A style poster", kind: "image", role: "primary_style_reference", textOnlyReference: true, uploadReference: false, sourceReferenceId: "brand-a-style" },
    ],
    [
        { url: "brand-b-product.png", name: "Brand B product", kind: "image", role: "product_truth_reference", uploadIndex: 1, uploaded: true },
    ]
);
const posterCopyOffPrompt = smartPosterCopyDisabledPrompt({ id: "poster-copy-off", type: "smart-prompt", posterCopyEnabled: false }, posterCopyOffProductBrandRefs);
check(
    /Remove or avoid copied external poster\/ad overlay copy/i.test(posterCopyOffPrompt) &&
        /Preserve authentic product-surface labels from product truth references/i.test(posterCopyOffPrompt) &&
        /Do not add invented external logos/i.test(posterCopyOffPrompt) &&
        !/\bno logos\b/i.test(posterCopyOffPrompt) &&
        !/\bno brand text\b/i.test(posterCopyOffPrompt),
    "Poster-copy-off prompt must remove external poster copy while preserving authentic product-surface labels without broad no-logo/no-brand-text wording."
);
check(
    /analysis-only\/non-uploaded/i.test(posterCopyOffPrompt) &&
        !/Image\s+2/i.test(posterCopyOffPrompt),
    "Analysis-only primary style guidance must not be described as an uploaded Image N for exact brand/copy preservation."
);
const brandLockPrompt = smartBrandIdentityPrompt(posterCopyOffProductBrandRefs);
check(
    /product-surface brand identity/i.test(brandLockPrompt) &&
        /Product-truth brand identity takes priority over old brand marks/i.test(brandLockPrompt) &&
        !/Brand A style poster/.test(brandLockPrompt),
    "Product replacement brand lock must prefer product-truth brand identity over old style-reference branding."
);

const overLimitWithDuplicates = [
    { url: "dup-a.png?v=1", kind: "image", role: "supporting_reference" },
    { url: "dup-a.png?v=2", kind: "image", role: "supporting_reference" },
    { url: "unique-1.png", kind: "image", role: "supporting_reference" },
    { url: "unique-2.png", kind: "image", role: "supporting_reference" },
    { url: "unique-3.png", kind: "image", role: "supporting_reference" },
    { url: "unique-4.png", kind: "image", role: "supporting_reference" },
];
const previousProviderBudget = smartProviderPromptBudget;
smartProviderPromptBudget = () => ({ maxReferenceImages: 5 });
const overLimitResolved = smartResolveFinalReferenceUploads(overLimitWithDuplicates, "", { engine: "api" }, "image");
smartProviderPromptBudget = previousProviderBudget;
check(
    overLimitResolved.referenceDeduplication.beforeCount === 6 &&
        overLimitResolved.referenceDeduplication.afterCount === 5 &&
        overLimitResolved.uploadReferences.length === 5,
    "Reference upload limits must be applied after same-image deduplication."
);
check(
    overLimitResolved.uploadReferences.map((ref) => ref.uploadIndex).join(",") === "1,2,3,4,5" &&
        smartFinalUploadedReferences(overLimitResolved.references).length === 5,
    "Deduplicated upload order, Image N mapping, and final uploaded references must stay aligned."
);

const productRetentionBudget = smartProviderPromptBudget;
const productRetentionLimit = (limit, fn) => {
    smartProviderPromptBudget = () => ({ maxReferenceImages: limit });
    try {
        return fn();
    } finally {
        smartProviderPromptBudget = productRetentionBudget;
    }
};
const retentionUrls = (result) => result.uploadReferences.map((ref) => ref.url).join(",");
const replacementStyle = { url: "retain-style.png", kind: "image", role: "primary_style_reference", sourceReferenceId: "style-main", manualOrder: 1 };
const replacementProduct = { url: "retain-product.png", kind: "image", role: "product_truth_reference", sourceReferenceId: "product-main", productRecognitionConfidence: 0.8, manualOrder: 2 };
const notOverLimitRetention = productRetentionLimit(5, () => smartResolveFinalReferenceUploads([replacementStyle, replacementProduct], "", { engine: "api" }, "image"));
check(
    retentionUrls(notOverLimitRetention) === "retain-style.png,retain-product.png" &&
        notOverLimitRetention.productTruthRetention.retentionApplied === false,
    "Product truth retention must not alter order when references are not over limit."
);

const overLimitAlreadyKept = productRetentionLimit(2, () => smartResolveFinalReferenceUploads(
    [
        replacementStyle,
        replacementProduct,
        { url: "retain-supporting.png", kind: "image", role: "supporting_reference", sourceReferenceId: "support-a", manualOrder: 3 },
    ],
    "",
    { engine: "api" },
    "image"
));
check(
    retentionUrls(overLimitAlreadyKept) === "retain-style.png,retain-product.png" &&
        overLimitAlreadyKept.productTruthRetention.wasOverLimit === true &&
        overLimitAlreadyKept.productTruthRetention.retentionApplied === false,
    "Product truth retention must not replace references when initial limit already keeps a product truth reference."
);

const productDroppedRetention = productRetentionLimit(3, () => smartResolveFinalReferenceUploads(
    [
        { url: "edit-base.png", kind: "image", role: "primary_reference", generatedEditBase: true, sourceReferenceId: "edit-base", manualOrder: 1 },
        { url: "style-main.png", kind: "image", role: "primary_style_reference", sourceReferenceId: "style-main", manualOrder: 2 },
        { url: "support-low.png", kind: "image", role: "supporting_reference", sourceReferenceId: "support-low", manualOrder: 3, referenceWeight: 20 },
        { url: "truth-late.png", kind: "image", role: "product_truth_reference", sourceReferenceId: "truth-late", productRecognitionConfidence: 0.9, width: 1400, height: 1200, manualOrder: 4 },
        { url: "support-extra.png", kind: "image", role: "supporting_reference", sourceReferenceId: "support-extra", manualOrder: 5 },
    ],
    "",
    { engine: "api" },
    "image"
));
check(
    retentionUrls(productDroppedRetention) === "edit-base.png,style-main.png,truth-late.png" &&
        productDroppedRetention.productTruthRetention.retentionApplied === true &&
        productDroppedRetention.productTruthRetention.productTruthAfterInitialLimit === 0 &&
        productDroppedRetention.productTruthRetention.retainedReferenceId === "truth-late" &&
        productDroppedRetention.productTruthRetention.displacedReferenceId === "support-low",
    "When product replacement references are over limit and product truth is dropped, the best product truth must replace the lowest-priority removable non-product reference."
);

const protectedRetention = productRetentionLimit(4, () => smartResolveFinalReferenceUploads(
    [
        { url: "protected-edit.png", kind: "image", role: "primary_reference", generatedEditBase: true, sourceReferenceId: "protected-edit", manualOrder: 1 },
        { url: "protected-structure.png", kind: "image", role: "composition_reference", structureLock: true, sourceReferenceId: "protected-structure", manualOrder: 2 },
        { url: "protected-pin.png", kind: "image", role: "supporting_reference", pinnedUpload: true, sourceReferenceId: "protected-pin", manualOrder: 3 },
        { url: "protected-required.png", kind: "image", role: "supporting_reference", required: true, sourceReferenceId: "protected-required", manualOrder: 4 },
        { url: "protected-product.png", kind: "image", role: "product_truth_reference", sourceReferenceId: "protected-product", manualOrder: 5 },
    ],
    "",
    { engine: "api" },
    "image"
));
check(
    retentionUrls(protectedRetention) === "protected-pin.png,protected-edit.png,protected-structure.png,protected-required.png" &&
        protectedRetention.productTruthRetention.retentionApplied === false &&
        /no safe non-product reference/i.test(protectedRetention.productTruthRetention.warning || ""),
    "Product truth retention must not displace generated edit base, structure lock, pinned, or required references."
);

const multiProductRetention = productRetentionLimit(3, () => smartResolveFinalReferenceUploads(
    [
        { url: "multi-style.png", kind: "image", role: "primary_style_reference", sourceReferenceId: "multi-style", manualOrder: 1 },
        { url: "multi-support.png", kind: "image", role: "supporting_reference", sourceReferenceId: "multi-support", manualOrder: 2 },
        { url: "multi-support-2.png", kind: "image", role: "supporting_reference", sourceReferenceId: "multi-support-2", manualOrder: 3 },
        { url: "multi-product-low.png", kind: "image", role: "product_truth_reference", sourceReferenceId: "multi-product-low", productRecognitionConfidence: 0.4, width: 800, height: 800, manualOrder: 4 },
        { url: "multi-product-best.png", kind: "image", role: "product_truth_reference", sourceReferenceId: "multi-product-best", productRecognitionConfidence: 0.95, width: 1600, height: 1600, manualOrder: 5 },
    ],
    "",
    { engine: "api" },
    "image"
));
check(
    multiProductRetention.uploadReferences.some((ref) => ref.url === "multi-product-best.png") &&
        !multiProductRetention.uploadReferences.some((ref) => ref.url === "multi-product-low.png") &&
        multiProductRetention.productTruthRetention.retainedReferenceId === "multi-product-best",
    "When several product truth references exist, retention must deterministically keep the best candidate."
);

const detailOnlyRetention = productRetentionLimit(2, () => smartResolveFinalReferenceUploads(
    [
        { url: "detail-style.png", kind: "image", role: "primary_style_reference", sourceReferenceId: "detail-style", manualOrder: 1 },
        { url: "detail-support.png", kind: "image", role: "supporting_reference", sourceReferenceId: "detail-support", manualOrder: 2 },
        { url: "detail-only.png", kind: "image", role: "product_detail_reference", sourceReferenceId: "detail-only", manualOrder: 3 },
    ],
    "",
    { engine: "api" },
    "image"
));
check(
    retentionUrls(detailOnlyRetention) === "detail-style.png,detail-only.png" &&
        detailOnlyRetention.productTruthRetention.productTruthBeforeLimit === 1 &&
        detailOnlyRetention.productTruthRetention.retentionApplied === true &&
        detailOnlyRetention.productTruthRetention.retainedReferenceId === "detail-only",
    "Product detail references must be treated as product truth for over-limit SKU retention."
);

const nonReplacementRetention = productRetentionLimit(2, () => smartResolveFinalReferenceUploads(
    [
        { url: "pure-product-a.png", kind: "image", role: "product_truth_reference", sourceReferenceId: "pure-product-a", manualOrder: 3 },
        { url: "pure-product-b.png", kind: "image", role: "product_truth_reference", sourceReferenceId: "pure-product-b", manualOrder: 4 },
        { url: "pure-product-c.png", kind: "image", role: "product_truth_reference", sourceReferenceId: "pure-product-c", manualOrder: 5 },
    ],
    "",
    { engine: "api" },
    "image"
));
check(
    nonReplacementRetention.productTruthRetention.isProductReplacementTask === false &&
        nonReplacementRetention.productTruthRetention.retentionApplied === false &&
        retentionUrls(nonReplacementRetention) === "pure-product-a.png,pure-product-b.png",
    "Pure product-reference tasks must not trigger product replacement retention."
);
check(
    productDroppedRetention.uploadReferences.length === 3 &&
        productDroppedRetention.uploadMap.some((item) => item.uploaded && item.roles.includes("product_truth_reference")) &&
        smartFinalUploadedReferences(productDroppedRetention.references).map((ref) => ref.uploadIndex).join(",") === "1,2,3",
    "Product truth retention must keep frozen upload references, upload map, and Image N mapping aligned."
);

const analysisOnlyStyle = {
    ...uploadStyle,
    textOnlyReference: true,
    uploadReference: false,
};
const analysisOnlyScenario = mappedUploadScenario(
    [analysisOnlyStyle, ...uploadProducts.slice(0, 3)],
    uploadProducts.slice(0, 3)
);
check(
    analysisOnlyScenario.finalUploads.map((ref) => ref.url).join(",") === "product-1.png,product-2.png,product-3.png" &&
        analysisOnlyScenario.finalUploads.map((ref) => ref.uploadIndex).join(",") === "1,2,3",
    "Analysis-only style routing must number the three uploaded product images as Image 1-3 in upload order."
);
check(
    !Object.prototype.hasOwnProperty.call(analysisOnlyScenario.uploadMap[0], "uploadIndex") &&
        analysisOnlyScenario.uploadMap[0].notUploadedReason === "analysis_only",
    "An analysis-only style reference must not own an uploadIndex."
);
check(
    analysisOnlyScenario.prompt.includes("Image 1: STRICT PRODUCT SKU reference (product-1.png).") &&
        analysisOnlyScenario.prompt.includes("Image 2 / 图2 (product-2.png)") &&
        analysisOnlyScenario.prompt.includes("Image 3 / 图3 (product-3.png)") &&
        analysisOnlyScenario.prompt.includes("analysis-only style guidance") &&
        !analysisOnlyScenario.prompt.includes("Image 4") &&
        !analysisOnlyScenario.prompt.includes("Image 1: uploaded style/composition reference"),
    "Analysis-only style prompts must use final product upload indexes and never retain the original style slot."
);
const remappedMentionTokens = smartRemapPromptReferenceTokens(
    "Image 1 controls style; 图2、图3、图4 control product truth.",
    [analysisOnlyStyle, ...uploadProducts.slice(0, 3)],
    analysisOnlyScenario.mappedRefs
);
check(
    remappedMentionTokens.includes("analysis-only style guidance controls style") &&
        remappedMentionTokens.includes("图1、图2、图3 control product truth") &&
        !remappedMentionTokens.includes("图4") &&
        !remappedMentionTokens.includes("Image 1 controls style"),
    "Mention-token Image N/图N references must be remapped through the final upload order."
);

const uploadedStyleScenario = mappedUploadScenario(
    [uploadStyle, ...uploadProducts.slice(0, 3)],
    [uploadStyle, ...uploadProducts.slice(0, 3)]
);
check(
    uploadedStyleScenario.finalUploads.map((ref) => ref.url).join(",") === "style.png,product-1.png,product-2.png,product-3.png" &&
        uploadedStyleScenario.finalUploads.map((ref) => ref.uploadIndex).join(",") === "1,2,3,4",
    "An uploaded style reference followed by three product images must retain Image 1-4 upload order."
);
check(
    uploadedStyleScenario.prompt.includes("Image 1: uploaded style/composition reference (style.png).") &&
        uploadedStyleScenario.prompt.includes("Image 2 / 图2 (product-1.png)") &&
        uploadedStyleScenario.prompt.includes("Image 4 / 图4 (product-3.png)"),
    "Uploaded style prompts must assign Image 1 to style and Image 2-4 to product truth."
);

const limitedScenario = mappedUploadScenario(
    [uploadStyle, ...uploadProducts],
    [uploadStyle, ...uploadProducts.slice(0, 2)]
);
check(
    limitedScenario.finalUploads.map((ref) => ref.uploadIndex).join(",") === "1,2,3" &&
        limitedScenario.prompt.includes("Image 3 / 图3 (product-2.png)") &&
        !limitedScenario.prompt.includes("Image 4") &&
        !limitedScenario.prompt.includes("product-3.png") &&
        !limitedScenario.prompt.includes("product-4.png"),
    "References removed by the upload limit must be absent and remaining upload indexes must stay contiguous."
);

const legacyPrompt = smartProductTruthRolePrompt([
    {url:"legacy-style.png", kind:"image", role:"primary_style_reference"},
    {url:"legacy-product.png", kind:"image", role:"product_detail_reference", name:"legacy-product.png"},
], true);
check(
    legacyPrompt.includes("Image 2 / 图2 (legacy-product.png)"),
    "Legacy references without final upload mapping fields must retain the previous numbering fallback."
);
[
    "smartOutputAspectRecomposePrompt",
    "smartLatestProductIdentityOverridePrompt",
    "smartProductTruthRolePrompt",
    "smartProductTruthContrastLockPrompt",
    "smartProductReplacementRolePrompt",
    "smartReferenceSimilarityRolePrompt",
    "smartEditBaseStructureLockPrompt",
    "smartPersonIdentityOverridePrompt",
    "smartUploadedReferenceMapPrompt",
    "smartPosterCopyLockPrompt",
    "smartBrandIdentityPrompt",
    "smartPosterCopyDisabledPrompt",
    "smartProductHandInteractionPrompt",
    "smartFinalProductCheckPrompt",
].forEach((name) => {
    check(
        /smartReference(?:IsFinalUploaded|FinalUploadIndex|PromptLabel|DisplayLabel|IsAnalysisOnlyGuidance)|smartFinalUploadedReferences/.test(functionSource(name)),
        `${name} must resolve reference status or labels from the final upload mapping.`
    );
});

const atomicCriticalBlocks = [
    [
        "OUTPUT CANVAS LOCK:",
        "Generate the final image on a 1024x1024px canvas.",
        "The selected canvas overrides every reference aspect ratio."
    ].join("\n"),
    [
        "UPLOADED IMAGE ROLE MAP:",
        "Image 1: STRICT PRODUCT SKU reference (product.png)."
    ].join("\n"),
    "Product truth references: Image 1 / 图1 (product.png). Preserve the exact SKU silhouette, materials, controls, and label placement.",
    "NO HUMAN SUBJECT LOCK: Generate a product-only image. No person, face, hand, arm, skin, or body part may appear.",
    "MANDATORY PRODUCT-HAND INTERACTION: If a permitted hand appears, preserve complete contact, grip geometry, occlusion, and contact shadows.",
    "POSTER COPY OFF / PRODUCT LABELS ON: Remove poster overlay copy while preserving the complete poster layout, brand identity, and product-surface labels.",
    "Style/reference similarity setting: 65/100. Preserve the current campaign family while creating a clearly new shot.",
    [
        "Highest priority user modification request:",
        "请保持产品结构完整，并使用干净的白色背景。",
        "Apply this latest request with highest priority."
    ].join("\n"),
    "FINAL PRODUCT CHECK: the hero object must match Image 1 / 图1 and must not become a generic substitute."
];
const fragmentRegressionPrompt = [
    ...atomicCriticalBlocks,
    "Product recognition summary from product reference images:\ncategory: beauty device\ncolors: white, clear\nmust preserve: exact glossy shell and transparent chamber with ve\nforbidden changes: do not change the nozzle geometry\nUse this as the strict product identity anchor.",
    "Reference summary:\nComplete reference sentence one. Complete reference sentence two. Complete reference sentence three.",
    "bject a hero product, generic product, or alternate shape.",
    "ot hide or redesign the distinguishing control and nozzle details.",
    "ct text is not readable, preserve complete product labels.",
    "tmosphere: Warm fresh commercial studio mood.",
    "ground tone, material finish, skin treatment, or product surface quality.",
    "with ve"
].join("\n\n");
const fragmentRegression = smartCompressPromptToBudget(fragmentRegressionPrompt, 3200);
check(fragmentRegression.prompt.length <= 3200, "Atomic prompt compression must stay within the selected character budget.");
check(fragmentRegression.integrityValid && smartPromptIntegrityCheck(fragmentRegression.prompt).valid, "Compressed prompts must pass local integrity validation.");
[
    "bject",
    "ot hide",
    "ct text",
    "tmosphere",
    "ground tone",
    "with ve"
].forEach((fragment) => {
    check(
        !fragmentRegression.prompt.split(/\r?\n/).some((line) => line.trim().toLowerCase().startsWith(fragment)),
        `Compressed prompts must remove the real truncated fragment: ${fragment}`
    );
});
atomicCriticalBlocks.forEach((block) => {
    const heading = block.split("\n")[0];
    const present = fragmentRegression.prompt.includes(heading);
    check(
        !present || fragmentRegression.prompt.includes(block),
        `${heading} must remain complete or be removed as one atomic block.`
    );
});
[
    atomicCriticalBlocks[0],
    atomicCriticalBlocks[1],
    atomicCriticalBlocks[2],
    atomicCriticalBlocks[7],
    atomicCriticalBlocks[8]
].forEach((block) => {
    check(fragmentRegression.prompt.includes(block), `${block.split("\n")[0]} must survive compression as a complete required block.`);
});

const longMustPreserve = "preserve exact white glossy rounded shell and transparent cylindrical lower chamber; ".repeat(24).trim();
const completeForbiddenChange = "do not change the nozzle geometry, control placement, or real-world proportions";
const productFactSummary = smartProductFactsSummary({
    category:"beauty device",
    main_colors:["white", "clear"],
    materials:["ABS", "glass"],
    silhouette:["rounded main body"],
    controls:["single circular button"],
    must_preserve:[longMustPreserve],
    forbidden_changes:[completeForbiddenChange],
    uncertain:["tiny unreadable text ".repeat(80)]
});
check(productFactSummary.length <= 1100, "Product fact summaries must keep the existing 1100-character budget.");
const productFactLines = productFactSummary.split("\n");
const mustLine = productFactLines.find((line) => line.startsWith("must preserve:"));
const forbiddenLine = productFactLines.find((line) => line.startsWith("forbidden changes:"));
check(!mustLine || mustLine === `must preserve: ${longMustPreserve}`, "must_preserve must be retained whole or removed as a whole field.");
check(!forbiddenLine || forbiddenLine === `forbidden changes: ${completeForbiddenChange}`, "forbidden_changes must be retained whole or removed as a whole field.");
check(!productFactSummary.endsWith("with ve"), "Product fact summaries must never end with a truncated field value.");

const balancedJson = '{"category":"设备","main_colors":["白色","蓝色"],"must_preserve":["完整结构"]}';
const multilingualPrompt = [
    "Highest priority user modification request:\n请保留完整产品结构。Keep the complete product geometry. 中英文混合内容必须完整！",
    `Structured product facts:\n${balancedJson}`,
    "Reference summary:\n纯中文句子。Pure English sentence remains complete! 标点密集：颜色、材质、轮廓；全部保持完整。",
    "FINAL PRODUCT CHECK: preserve the complete product and every retained rule."
].join("\n\n");
const multilingualResult = smartCompressPromptToBudget(multilingualPrompt, 900);
check(multilingualResult.prompt.length <= 900, "Mixed-language compression must respect the budget.");
check(smartPromptIntegrityCheck(multilingualResult.prompt).valid, "Chinese, English, mixed punctuation, and JSON must remain structurally valid.");
check(!multilingualResult.prompt.includes("{") || multilingualResult.prompt.includes(balancedJson), "JSON content must remain whole or be removed as one atomic unit.");
check(smartPromptUnicodeValid(multilingualResult.prompt), "Compression must not create broken Unicode surrogate pairs.");

const shortPrompt = "纯中文短提示。\n\nKeep this short English prompt unchanged.\n\n中英文 mixed prompt remains complete.";
const shortResult = smartCompressPromptToBudget(shortPrompt, 1200);
check(shortResult.prompt === shortPrompt, "A prompt below budget must remain unchanged.");
check(shortResult.changed === false, "A prompt below budget must not report compression.");

[
    "bject a hero product and preserve all details.",
    "ot hide the controls or nozzle geometry.",
    "ct text is not readable and should remain complete.",
    "tmosphere: Warm commercial studio mood.",
    "ground tone, material finish, and product surface quality.",
    "must preserve: exact shell with ve",
    "UPLOADED IMAGE ROLE MAP:\nImage 1 / 图"
].forEach((invalidPrompt) => {
    check(!smartPromptIntegrityCheck(invalidPrompt).valid, `Integrity validation must reject truncated content: ${invalidPrompt}`);
});
check(!smartPromptIntegrityCheck('{"category":"device","must_preserve":["complete"]').valid, "Integrity validation must reject unclosed JSON.");
check(!smartPromptUnicodeValid(`broken ${String.fromCharCode(0xD83D)}`), "Integrity validation must reject a lone Unicode surrogate.");

check(
    !functionSource("smartClipPromptSection").includes(".slice(") &&
        !functionSource("smartCompressPromptToBudget").includes(".slice(") &&
        !functionSource("smartProductFactsSummary").includes(".slice("),
    "Natural-language prompt compression must not use direct string slicing."
);

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

function route(refs, weight = 65, nodeExtras = {}) {
    const node = { id: "test-node", referenceWeight: weight, ...nodeExtras };
    const prioritized = smartPrioritizeGenerationReferences(refs);
    const decorated = smartDecorateReferenceWeights(node, prioritized, nodeExtras.prompt || "");
    return decorated.filter(smartReferenceUploadAllowed);
}
function decorateRoute(refs, weight = 65, nodeExtras = {}) {
    const node = { id: "test-node", referenceWeight: weight, ...nodeExtras };
    const prioritized = smartPrioritizeGenerationReferences(refs);
    return smartDecorateReferenceWeights(node, prioritized, nodeExtras.prompt || "");
}

const frozenSimilarityDecorated = smartDecorateReferenceWeights(
    { id: "frozen-sim-node", referenceWeight: 15 },
    [primary, product],
    "Original reference similarity: 15/100.\nReference similarity: 60/100.",
    null,
    currentSimilarityState
);
check(
    frozenSimilarityDecorated.find((ref) => ref.role === "composition_reference")?.referenceWeight === 65,
    "Style/composition references must use the frozen effectiveReferenceSimilarity instead of stale prompt values."
);
check(
    frozenSimilarityDecorated.find((ref) => ref.role === "product_truth_reference")?.referenceWeight === 100,
    "Product truth references must keep fixed 100 strength and ignore style similarity changes."
);
const productOnlySimilarityPrompt = smartReferenceSimilarityRolePrompt([product], false, { referenceWeight: 65 }, "保持相似的布光和背景色", currentSimilarityState);
check(
    !/Style\/reference similarity setting:/i.test(productOnlySimilarityPrompt) &&
        /Product reference strength:\s*100\/100/.test(productOnlySimilarityPrompt),
    "Product-only runs must not emit a style similarity control, while product strength remains 100/100."
);

const mediumPersonWithCase = route([primary, caseRef], 65);
check(
    mediumPersonWithCase.some((ref) => ref.role === "composition_reference") &&
        !mediumPersonWithCase.some((ref) => ref.role === "case_style_reference"),
    "A 65-weight full-person main reference must upload while case images remain text-only."
);
for (const weight of [0, 35, 65, 90, 100]) {
    const decoratedPerson = decorateRoute([primary], weight)[0];
    check(
        smartReferenceUploadAllowed(decoratedPerson) && decoratedPerson.referenceWeight === weight,
        `A main person/style reference must upload at ${weight}/100 and keep that exact similarity weight.`
    );
    check(
        decoratedPerson.identitySuppressionReference !== true &&
            decoratedPerson.referenceVisualProxy !== true &&
            decoratedPerson.personVisualProxy !== true,
        `A main person/style reference at ${weight}/100 must upload the real main reference, not an identity-suppressed proxy.`
    );
}

const posterCopyPersonWithProduct = route([primary, product, caseRef], 65, { posterCopyEnabled: true });
check(posterCopyPersonWithProduct.some((ref) => ref.role === "composition_reference" && smartReferenceUploadAllowed(ref)), "Poster-copy must keep a sub-90 full-person main reference uploaded.");
const samePersonPromptRefs = route([primary, product], 65, { posterCopyEnabled: true, prompt: "Keep the same person identity from the reference." });
check(samePersonPromptRefs.some((ref) => ref.role === "composition_reference" && smartReferenceUploadAllowed(ref)), "Even an explicit same-person prompt must keep the main reference uploaded; prompt rules below 100 force a different identity.");
check(posterCopyPersonWithProduct.some((ref) => ref.role === "product_truth_reference"), "Poster-copy mode must still keep product truth references.");
const strictPosterCopy = route([primary], 90, { posterCopyEnabled: true });
check(strictPosterCopy.some((ref) => ref.posterCopyReference && ref.copyTextLock && ref.inputFidelity === "high"), "Poster-copy text hard lock for full-person references should be reserved for 90+ reference weight.");

const posterCopyOffPersonWithProduct = route([primary, product, caseRef], 65, { type: "smart-prompt", posterCopyEnabled: false });
check(
    posterCopyOffPersonWithProduct.some((ref) => ref.role === "composition_reference" && smartReferenceUploadAllowed(ref)) &&
        posterCopyOffPersonWithProduct.some((ref) => ref.role === "product_truth_reference"),
    "Poster-copy disabled must keep a sub-90 full-person main reference uploaded while product truth remains present."
);

const posterPromptUpstream = { id: "poster-prompt-upstream", type: "smart-prompt", posterCopyEnabled: true };
const posterTargetNode = { id: "poster-target-node", type: "smart-image" };
inputNodesFor = (node) => node?.id === posterTargetNode.id ? [posterPromptUpstream] : [];
check(
    smartPosterCopyEnabledForGeneration(posterTargetNode),
    "A downstream image node must inherit Poster copy from its upstream prompt node."
);
const inheritedPosterRefs = smartDecorateReferenceWeights(posterTargetNode, [{
    ...primary,
    generatedEditBase: true,
    referenceWeight: 65
}]);
check(
    inheritedPosterRefs[0]?.uploadReference === true &&
        inheritedPosterRefs[0]?.textOnlyReference === false &&
        inheritedPosterRefs[0]?.inputFidelity === "low",
    "A sub-90 generated edit-base must still upload; the weight and prompt control visual similarity."
);
const posterOverrideOff = {
    id: "poster-override-off",
    type: "smart-image",
    generatedPromptInitialized: true,
    posterCopyEnabled: false
};
inputNodesFor = (node) => node?.id === posterOverrideOff.id ? [posterPromptUpstream] : [];
check(
    !smartPosterCopyEnabledForGeneration(posterOverrideOff),
    "A generated-image card explicitly switched off must override an upstream Poster-copy switch."
);
inputNodesFor = () => [];

const highPersonWithCase = route([primary, caseRef], 90);
check(highPersonWithCase.length === 1, "At 90+, only the original person/style reference may upload.");
check(highPersonWithCase[0].role === "composition_reference", "A case image must never replace the original high-weight reference.");
check(!highPersonWithCase.some((ref) => ref.role === "case_style_reference"), "Case references must never upload.");

const productFlow = route([primary, product, caseRef], 65);
check(productFlow.some((ref) => ref.role === "product_truth_reference"), "Product truth reference must upload.");
check(!productFlow.some((ref) => ref.role === "case_style_reference"), "Case reference must not upload when product truth exists.");

const firstGeneratedBase = {
    url: "generated-color.png",
    kind: "image",
    role: "composition_reference",
    generatedEditBase: true,
    structureLock: true,
    referenceWeight: 100
};
const secondGeneratedBase = {
    url: "generated-line-art.png",
    kind: "image",
    role: "composition_reference",
    generatedEditBase: true,
    structureLock: true,
    referenceWeight: 100
};
const multipleGeneratedRefs = route([firstGeneratedBase, secondGeneratedBase], 65);
check(multipleGeneratedRefs.length === 2, "Multiple directly linked generated images must all remain visible and uploadable.");
check(
    multipleGeneratedRefs[0].generatedEditBase === true &&
        multipleGeneratedRefs[0].role === "composition_reference",
    "The first linked generated image must remain the primary edit base."
);
check(
    multipleGeneratedRefs[1].generatedEditBase === false &&
        multipleGeneratedRefs[1].structureLock === false &&
        multipleGeneratedRefs[1].role === "supporting_reference",
    "Additional linked generated images must become supporting references instead of being dropped or competing as strict edit bases."
);

const nonPersonStyle = { url: "studio.png", kind: "image", role: "composition_reference", name: "clean studio reference" };
check(route([nonPersonStyle], 65).length === 1, "A normal non-person style reference at 65 should upload.");
for (const weight of [0, 35, 65, 90, 100]) {
    const decoratedNonPerson = decorateRoute([nonPersonStyle], weight)[0];
    check(
        smartReferenceUploadAllowed(decoratedNonPerson) && decoratedNonPerson.referenceWeight === weight,
        `A main non-human style reference must upload at ${weight}/100 and keep that exact similarity weight.`
    );
}
check(
    route([nonPersonStyle], 65, {
        llmInstruction: "Generate a portrait with a woman using the product.",
        styleMatch: { analysis: { positive_prompt: "beauty model face hair portrait" } }
    }).length === 1,
    "A style reference whose analysis is a human portrait may upload, while person identity is controlled by prompt rules."
);
check(
    route([nonPersonStyle], 65, { llmInstruction: "背景颜色配色改变一下" }).length === 1,
    "An explicit background/palette change must not disable the main style reference upload; prompt rules control variation."
);

check(
    !smartGenerationAllowsHuman(
        {
            id: "product-only-latest-request",
            llmInstruction: "This product is a scalp-care massage brush; generate one product poster.",
            styleMatch: { analysis: { positive_prompt: "beauty model, hand placement, face angle, skin finish" } },
        },
        [nonPersonStyle],
        "Reference summary: preserve broad model styling category, hand placement, and face angle."
    ),
    "Style/case analysis text must not introduce people when the latest request and references do not include a human subject."
);
check(
    !smartGenerationAllowsHuman(
        { id: "system-stale-human-words" },
        [nonPersonStyle],
        "Product truth references: Image 2.\nReference summary: preserve broad person styling category, hand placement, and face angle."
    ),
    "System-generated prompt text with stale person words must not open human generation by itself."
);
check(
    smartGenerationAllowsHuman({ id: "raw-human-request" }, [], "A woman holding the product in her hand."),
    "A direct raw user prompt that asks for a person must still allow human content."
);
check(
    smartGenerationAllowsHuman(
        { id: "person-reference" },
        [{ url: "portrait.png", kind: "image", role: "composition_reference", containsPerson: true }],
        "Generate in the same campaign style."
    ),
    "A reference explicitly marked as containing a person must still allow human content."
);
const productHandOnlyRef = {
    url: "hand-product.png",
    kind: "image",
    role: "product_truth_reference",
    containsPerson: true,
    containsHandOnly: true,
    name: "product held by a hand"
};
const productHandPermission = smartHumanPermissionState({ id: "product-hand-only" }, [productHandOnlyRef], "Generate a premium product poster.");
check(
    productHandPermission.allowsHuman === false &&
        productHandPermission.humanPermissionSource === "none" &&
        smartReferenceLikelyContainsHandOnly(productHandOnlyRef) === true &&
        smartReferenceLikelyContainsPartialHumanOnly(productHandOnlyRef) === true,
    "Product references containing only hands must not open full human/model generation."
);
const croppedFootOnlyRef = {
    url: "cropped-foot-product.png",
    kind: "image",
    role: "composition_reference",
    containsPerson: true,
    name: "cropped foot only touching the product",
    referenceWeight: 85,
    uploadIndex: 1,
    uploaded: true,
    sourceReferenceId: "cropped-foot"
};
check(
    smartReferenceLikelyContainsPartialHumanOnly(croppedFootOnlyRef) === true &&
        smartReferenceCanOpenHumanPermission({ id: "cropped-foot" }, croppedFootOnlyRef, 0) === false &&
        smartHumanPermissionState({ id: "cropped-foot" }, [croppedFootOnlyRef], "Generate the same product campaign style.").allowsHuman === false,
    "Cropped leg/foot/body-part references must remain partial and must not open full model generation."
);
const partialHumanNoFullPrompt = smartNoHumanSubjectPrompt(false, true, ["Image 1 / 图1"]);
check(
    partialHumanNoFullPrompt.includes("NO FULL HUMAN SUBJECT LOCK:") &&
        partialHumanNoFullPrompt.includes("do not extend a hand, leg, foot, arm, or skin patch into an unseen complete person") &&
        !partialHumanNoFullPrompt.includes("NO HUMAN SUBJECT LOCK:"),
    "Partial human references must use a no-full-person lock instead of the old no-body-part lock."
);
const partialHumanLockPrompt = smartPartialHumanReferenceLockPrompt([productHandOnlyRef], false);
check(
    partialHumanLockPrompt.includes("PARTIAL HUMAN REFERENCE LOCK:") &&
        partialHumanLockPrompt.includes("A partial hand holding the product means a partial hand/forearm contact only") &&
        partialHumanLockPrompt.includes("no face, head, hair"),
    "Partial body-part references must preserve only visible body parts and forbid expanding into a full person."
);
const primaryPersonRef = { url: "primary-model.png", kind: "image", role: "primary_style_reference", containsPerson: true, referenceWeight: 85, uploadIndex: 1, uploaded: true, sourceReferenceId: "primary-model" };
const primaryPersonPermission = smartHumanPermissionState({ id: "primary-person" }, [primaryPersonRef], "Generate in this campaign style.");
check(
    primaryPersonPermission.allowsHuman === true &&
        primaryPersonPermission.humanPermissionSource === "primary-model",
    "Uploaded high-weight primary style/composition references with a person may open human generation."
);
const casePersonPermission = smartHumanPermissionState(
    { id: "case-person" },
    [{ url: "case-person.png", kind: "image", role: "case_style_reference", containsPerson: true, referenceWeight: 100 }],
    "Generate a product poster."
);
check(casePersonPermission.allowsHuman === false, "Case-library person references must not open human generation by themselves.");
check(
    smartHumanPermissionState({ id: "explicit-human" }, [productHandOnlyRef], "A woman holding the product.").humanPermissionSource === "latest_user_instruction",
    "An explicit latest user request for a person must open human generation regardless of other references."
);
check(
    smartHumanPermissionState({ id: "explicit-no-human" }, [primaryPersonRef], "No people, product-only still life.").allowsHuman === false,
    "An explicit latest user request forbidding people must override a person-containing primary reference."
);

check(
    smartTextExplicitlyRequestsHuman("人物和产品有互动，两只脚踩在产品踏板上"),
    "Foot/leg/product-interaction requests must explicitly allow a human subject."
);
check(
    !smartTextExplicitlyRequestsHuman("不要人物，纯产品静物图"),
    "An explicit product-only request must still forbid a human subject."
);
const generatedEditUpstream = {
    id: "generated-edit-upstream",
    type: "smart-image",
    generatedPromptInitialized: true,
    llmInstruction: "人物和产品有互动，两只脚踩在产品踏板上",
    promptDraftText: "NO HUMAN SUBJECT LOCK: stale product-only instruction."
};
const generatedEditTarget = { id: "generated-edit-target", type: "smart-image" };
inputNodesFor = (node) => node?.id === generatedEditTarget.id ? [generatedEditUpstream] : [];
check(
    smartGenerationAllowsHuman(generatedEditTarget, [], "NO HUMAN SUBJECT LOCK: stale product-only instruction."),
    "A downstream image node must inherit the generated edit node's latest human-interaction request and suppress a stale no-human lock."
);
inputNodesFor = () => [];

check(smartPersonSimilarityInstruction(0).includes("zero person-reference strength"), "0 person tier must fully disable the reference person.");
check(smartPersonSimilarityInstruction(20).includes("new unrelated model/person"), "1-34 person tier must force a new person.");
check(smartPersonSimilarityInstruction(45).includes("clearly different person"), "35-59 person tier must force a clearly different person.");
check(smartPersonSimilarityInstruction(65).includes("MUST NOT be the same reference person"), "60-89 person tier must avoid same identity.");
check(smartPersonSimilarityInstruction(90).includes("NOT an exact same-person identity lock"), "90-99 person tier must avoid exact identity locking.");
check(smartPersonSimilarityInstruction(100).includes("exact identity mode"), "100 person tier is the only exact identity mode.");
check(
    smartPersonSimilarityInstruction(0).includes("pose geometry") &&
        smartPersonSimilarityInstruction(35).includes("pose geometry") &&
        smartPersonSimilarityInstruction(65).includes("pose geometry") &&
        smartPersonSimilarityInstruction(90).includes("pose geometry"),
    "Person tiers below 100 must preserve the reference pose/composition while changing person identity."
);
check(
    !/change crop, pose, hand placement/.test(smartPersonSimilarityInstruction(35)) &&
        !/change the model pose, hand placement/.test(smartPersonSimilarityInstruction(20)),
    "Person identity anti-copy instructions must not tell the model to change the reference pose."
);
check(
    smartNonHumanReferenceSimilarityInstruction(0).includes("weakest-reference mode") &&
        smartNonHumanReferenceSimilarityInstruction(0).includes("must not become completely unrelated") &&
        smartNonHumanReferenceSimilarityInstruction(20).includes("visible family resemblance") &&
        smartNonHumanReferenceSimilarityInstruction(45).includes("do not drift into a completely different scene style") &&
        smartNonHumanReferenceSimilarityInstruction(65).includes("clearly belongs to the same reference family") &&
        smartNonHumanReferenceSimilarityInstruction(90).includes("followed closely"),
    "Non-human scene tiers must vary by weight while never fully drifting away from the reference."
);
check(
    !smartNonHumanReferenceSimilarityInstruction(0).includes("do not use it as a style") &&
        !smartNonHumanReferenceSimilarityInstruction(0).includes("visual similarity strength is zero"),
    "0 non-human scene weight must be weak guidance, not a full ignore instruction."
);

check(
    backendSource.includes('and image_reference_role(ref) != "case_style_reference"') &&
        !backendSource.includes("matchedCasePair: bool"),
    "Backend must reject every case-style image reference."
);
check(
    backendSource.includes("def image_reference_similarity_max_size") &&
        backendSource.includes("if weight >= 100:") &&
        backendSource.includes("if weight >= 90:") &&
        backendSource.includes("if weight >= 60:") &&
        backendSource.includes("if weight >= 35:") &&
        backendSource.includes("if weight > 0:") &&
        backendSource.includes("return 1280") &&
        backendSource.includes("return 1024") &&
        backendSource.includes("return 768") &&
        backendSource.includes("return 640") &&
        backendSource.includes("return 512") &&
        !backendSource.includes("return 192"),
    "Backend style-reference uploads must stay enabled at 0-100 while keeping a weak scene anchor even at 0."
);
check(
    backendSource.includes("containsPerson: Optional[bool]") &&
        backendSource.includes("def image_reference_has_human_signal") &&
        backendSource.includes("return 1536 if weight >= 100 else 1024") &&
        !backendSource.includes("def reference_uses_identity_suppression_proxy") &&
        !backendSource.includes("def apply_identity_suppression_proxy") &&
        !backendSource.includes("proxy_ref_") &&
        !backendSource.includes("use_identity_proxy"),
    "Backend must upload the real main person/human reference at every weight and must not use identity-suppressed proxy images."
);
check(
    source.includes("it is allowed to closely follow or copy the reference layout and design system for both human/person scenes and non-human/product scenes") &&
        source.includes("Poster-copy text/layout lock") &&
        source.includes("Poster-copy layout/design rule") &&
        source.includes("unless the latest user request explicitly asks for different text, layout, or design") &&
        !source.includes("Poster-copy text lock does not increase visual similarity") &&
        !source.includes("redesign the surrounding layout, product placement, background, camera, crop, props, and negative-space distribution as a new image"),
    "Poster-copy enabled references must be allowed to copy layout/design for both human and non-human scenes unless the user explicitly overrides copy/layout."
);
check(
    backendSource.includes("as both a text guide and a poster layout/design-system guide") &&
        backendSource.includes("closely follow or copy the reference layout and design for both human/person scenes and non-human/product scenes") &&
        backendSource.includes("copy layout and poster design system may also be closely followed or copied"),
    "Backend prompt rematching must preserve poster-copy layout/design guidance, not reduce it to lightweight text only."
);
check(
    backendSource.includes('return 1536') &&
        backendSource.includes("posterCopyReference") &&
        backendSource.includes("strict_structure_lock") &&
        backendSource.includes("ai_ref_has_poster_copy_lock") &&
        backendSource.includes('role in {"product_truth_reference", "product_detail_reference", "mask"}') &&
        backendSource.includes('and ai_ref_weight(ref, 50) >= 90') &&
        !backendSource.includes('structure_lock or poster_copy_lock or input_fidelity == "high"'),
    "Product and 90+/100 strict-reference compression must remain high while low-weight references must not force high fidelity."
);
check(
    backendSource.includes("def image_reference_is_product") &&
        backendSource.includes("def gpt_image_reference_selection_priority") &&
        backendSource.includes("for ref in gpt_image_reference_subset(prompt, image_refs)") &&
        backendSource.includes("return [ref for index, ref in enumerate(items) if index in selected_indexes]"),
    "Backend reference subset selection must preserve Image N order while keeping product truth/detail references over low-priority extras."
);
check(
    backendSource.includes("IMAGE_GENERATION_READ_TIMEOUT") &&
        backendSource.includes("read=IMAGE_GENERATION_READ_TIMEOUT") &&
        !backendSource.includes("read=1800.0) if (is_gpt2"),
    "GPT image generation requests must use a bounded read timeout instead of waiting 1800s by default."
);
check(
    backendSource.includes('tempfile.mkstemp(prefix="sized_ref_"') &&
        backendSource.includes("temp_paths.append(temp_path)"),
    "Multipart reference resizing must use temporary copies."
);
check(
    source.includes("const strictEditBase = weight >= 100") &&
        source.includes("inputFidelity:weight >= 90 ? 'high' : 'low'") &&
        source.includes("const strictEditBase = editBaseWeight >= 100") &&
        source.includes("inputFidelity:editBaseWeight >= 90"),
    "Generated edit-base references must upload at every weight, but only 100 locks structure and only 90+ marks high fidelity."
);
check(
    backendSource.includes("camera_control: str") &&
        backendSource.includes("poster_copy_enabled: bool") &&
        backendSource.includes("Immutable UI camera control") &&
        backendSource.includes("Immutable UI Poster copy switch") &&
        backendSource.includes("_poster_copy_enabled") &&
        backendSource.includes("_latest_changes_background_palette"),
    "Prompt rematching must preserve UI camera/poster-copy controls and clear stale background/palette locks."
);
check(
    source.includes("image:editBase.url") &&
        source.includes("analysis:{}") &&
        source.includes("user_request:userRequest"),
    "Generated-image prompt rematching must force a fresh visual analysis of the current generated image."
);
check(
    source.includes("if(!smartPosterCopyEnabledForGeneration(node)) return '';") &&
        source.includes("posterCopyReference:posterCopyLock") &&
        source.includes("copyTextLock:posterCopyLock &&") &&
        source.includes("smartPosterCopyReferenceFidelity") &&
        source.includes("This lock overrides earlier no-readable-text"),
    "Poster-copy state must propagate downstream and override stale no-text instructions."
);
check(
    source.includes("function smartBrandIdentityPrompt") &&
        source.includes("BRAND IDENTITY LOCK:") &&
        source.includes("Product-truth brand identity takes priority over old brand marks") &&
        source.includes("Do not infer exact brand/logo/text from non-uploaded analysis-only guidance") &&
        source.includes("brandIdentityPrompt") &&
        backendSource.includes("def gpt_image_reference_limit") &&
        (backendSource.includes("gpt_image_reference_subset(prompt, image_refs)") || backendSource.includes("gpt_image_reference_limit(prompt, image_refs)") || backendSource.includes("smartGenerationReferenceLimit")) &&
        backendSource.includes("def style_brand_identity_lock_prompt") &&
        backendSource.includes("BRAND IDENTITY LOCK:") &&
        backendSource.includes("Product-truth brand marks") &&
        backendSource.includes("Do not infer exact logo"),
    "Brand/logo identity must be locked independently from the Poster copy switch."
);
check(
    source.includes("function smartPosterCopyDisabledPrompt") &&
        source.includes("Preserve authentic product-surface labels from product truth references") &&
        source.includes("Do not add invented external logos") &&
        source.includes("analysis-only/non-uploaded") &&
        source.includes("Disabling Poster copy is only a poster-text removal control") &&
        backendSource.includes("Preserve product-surface text as product identity") &&
        backendSource.includes("do not require exact logo") &&
        backendSource.includes("printed packaging graphics") &&
        backendSource.includes("should remain on the product") &&
        !source.includes("label, logo text, watermark") &&
        !backendSource.includes("label, logo text, watermark"),
    "Poster-copy disabled mode must remove poster overlay copy while preserving product/package labels."
);
check(
    source.includes("function smartHumanPermissionState") &&
        source.includes("function smartReferenceCanOpenHumanPermission") &&
        source.includes("containsHandOnly") &&
        source.includes("containsPartialHumanOnly") &&
        source.includes("smartReferenceLikelyContainsPartialHumanOnly") &&
        source.includes("hasPersonIdentityReference") &&
        source.includes("humanPermissionSource") &&
        source.includes("allowsHuman:humanPermission.allowsHuman === true"),
    "Human permission must separate raw person/hand detection from the actual source that allows full human generation."
);
check(
    backendSource.includes("Product surface quality guard:") &&
        backendSource.includes("style_product_surface_guard_applies") &&
        backendSource.includes("strip_product_surface_guard_blocks") &&
        backendSource.includes("random discoloration") &&
        backendSource.includes("explicitly requested aged/weathered/distressed texture"),
    "Style rematching must add a product-only surface quality guard without blocking intentional aged textures."
);

const cameraLockedVariant = new Function(
    "smartCameraControlRequested",
    "smartRelaxPromptForCameraControl",
    `${functionSource("smartVariantPrompt")}; return smartVariantPrompt;`
)(
    (prompt) => String(prompt || "").includes("HIGHEST PRIORITY CAMERA OVERRIDE"),
    (prompt) => String(prompt || "")
);
const cameraVariantPrompt = cameraLockedVariant(
    "HIGHEST PRIORITY CAMERA OVERRIDE: fixed 50mm front low-angle camera.\n不同动作角度",
    1,
    2,
    []
);
check(cameraVariantPrompt.includes("CAMERA-LOCKED VARIANT:"), "Camera-controlled multi-image variants must stay camera-locked.");
check(!cameraVariantPrompt.includes("Three-quarter side view"), "Camera-controlled variants must not inject a side camera.");
check(!cameraVariantPrompt.includes("higher viewpoint"), "Camera-controlled variants must not inject a higher camera.");

const stripStaleVisualLocks = new Function(
    `${functionSource("smartStripStaleBackgroundPaletteLocks")}; return smartStripStaleBackgroundPaletteLocks;`
)();
const cleanedVisualPrompt = stripStaleVisualLocks([
    "Preserve a bright warm orange studio background with the same palette.",
    "LATEST BACKGROUND/PALETTE OVERRIDE: use the newly requested mint-blue background.",
    "Product truth must remain exact."
].join("\n\n"));
check(!cleanedVisualPrompt.includes("bright warm orange"), "Stale reference background locks must be removed at generation time.");
check(cleanedVisualPrompt.includes("mint-blue background"), "The latest requested background must survive stale-lock cleanup.");
check(cleanedVisualPrompt.includes("Product truth"), "Stale-lock cleanup must preserve product truth.");

check(
    backendSource.includes("request_id: str") &&
        backendSource.includes("batch_index: Optional[int]") &&
        backendSource.includes("CANVAS_TASK_REQUEST_INDEX") &&
        backendSource.includes("on_upstream_task_id") &&
        backendSource.includes('"upstream_task_id"'),
    "Canvas image tasks must persist request metadata and upstream task ids for recovery."
);
check(
    canvasSource.includes("Promise.allSettled(submitPayloads.map") &&
        canvasSource.includes("fetchCanvasTaskWithRetry") &&
        canvasSource.includes("retryCanvasSubmitPending") &&
        canvasSource.includes("shouldResumeCanvasImagePending") &&
        canvasSource.includes("request_id:requestId") &&
        canvasSource.includes("batch_index:index") &&
        canvasSource.includes("CANVAS_TASK_RETRY_STATUSES = new Set([429, 502, 503, 504])"),
    "Normal canvas task submission must be itemized, retryable, idempotent, and resumable."
);
check(
    source.includes("Promise.allSettled(submitPayloads.map") &&
        source.includes("fetchSmartCanvasTaskWithRetry") &&
        source.includes("retrySmartSubmitPending") &&
        source.includes("shouldResumeSmartPendingTask") &&
        source.includes("smartPendingTaskFromSubmitFailure") &&
        source.includes("request_id:requestId") &&
        source.includes("batch_index:index") &&
        source.includes("SMART_TASK_RETRY_STATUSES = new Set([429, 502, 503, 504])"),
    "Smart canvas task submission must be itemized, retryable, idempotent, and resumable."
);
check(
    source.includes("function createSmartRunContext") &&
        source.includes("requestId") &&
        source.includes("referenceSetHash") &&
        source.includes("compilerVersion:'phase4-smart-v1'") &&
        canvasSource.includes("function createCanvasRunContext") &&
        canvasSource.includes("referenceSetHash"),
    "Phase 4 must isolate generation parameters in runContext snapshots."
);
check(
    source.includes("prompt_build_ms") &&
        source.includes("product_recognition_ms") &&
        source.includes("reference_resolve_ms") &&
        source.includes("provider_submit_ms") &&
        source.includes("request_body_bytes") &&
        canvasSource.includes("estimated_prompt_tokens") &&
        backendSource.includes('"diagnostics"'),
    "Generation diagnostics must track prompt, reference, submit, and request-size timing metadata."
);
check(
    source.includes("function smartAnalyzeReferencePreflight") &&
        source.includes("notUploadedReasons") &&
        source.includes("maxReferenceImages") &&
        source.includes("hasProductConflict") &&
        source.includes("userRole") &&
        source.includes("autoRole") &&
        source.includes("effectiveReferenceSimilarity") &&
        source.includes("similarityAppliedToUploadDecision") &&
        source.includes("similarityPromptEmitted") &&
        source.includes("referenceDeduplication:resolved.referenceDeduplication"),
    "Reference preflight must expose upload decisions, roles, limits, and not-uploaded reasons."
);
check(
        source.includes("SMART_PRODUCT_RECOGNITION_PROMPT_VERSION") &&
        source.includes('"category":""') &&
        source.includes("normalizeSmartProductFacts") &&
        source.includes("parseSmartProductFacts") &&
        source.includes("async function smartProductRecognitionCacheKey(refs=[], model='')"),
    "Product recognition must use structured JSON facts with versioned cache keys."
);
check(
    source.includes("function smartGenerationSpecFromContext") &&
        source.includes("generation_spec:generationSpec") &&
        source.includes("generation_spec_hash:specHash") &&
        source.includes("reference_similarity:{") &&
        backendSource.includes("generation_spec: Optional[Dict[str, Any]]"),
    "Phase 4 must add a lightweight Generation Spec compatibility layer."
);
check(
    source.includes("function smartResolveEffectiveReferenceSimilarity") &&
        source.includes("function smartStripStaleReferenceSimilarityStatements") &&
        source.includes("function smartNormalizeCurrentReferenceSimilarityStatements") &&
        source.includes("removedStaleSimilarityStatements") &&
        backendSource.includes("def strip_stale_reference_similarity_statements") &&
        backendSource.includes("Current effective reference similarity:"),
    "Reference similarity must have one effective source, stale-control cleanup, and diagnostics."
);
check(
    source.includes("function createFrozenGenerationRequest") &&
        source.includes("frozenCompiledRequest:true") &&
        source.includes("compileId:uid('compiled_req')") &&
        source.includes("requestFingerprint") &&
        source.includes("uploadedReferenceMap") &&
        source.includes("const uploadReferences = smartCloneReferenceList(trace.referencePreflight?.uploadReferences || [])") &&
        source.includes("generationSpec:smartCloneFrozenValue(generationSpec, null)") &&
        source.includes("referencePreflight:smartCloneFrozenValue(trace.referencePreflight || null, null)") &&
        source.includes("effectiveReferenceSimilarity:similarityState.effectiveReferenceSimilarity") &&
        source.includes("guardVersion:SMART_CANVAS_GUARD_VERSION") &&
        source.includes("appliedGuards:smartPromptAppliedGuardIds(prompt)"),
    "Frozen compiled requests must preserve prompt, settings, upload map, generationSpec, preflight, similarity, and diagnostics metadata."
);
check(
    source.includes("const SMART_CANVAS_GUARD_VERSION = 'canvas-guard-v1'") &&
        source.includes("function smartPromptAppliedGuardIds") &&
        source.includes("guard_version:SMART_CANVAS_GUARD_VERSION") &&
        source.includes("applied_guards:finalAppliedGuards") &&
        backendSource.includes('CANVAS_GUARD_VERSION = "canvas-guard-v1"') &&
        backendSource.includes("guardSkippedAsDuplicate") &&
        backendSource.includes("backendAddedGuards") &&
        backendSource.includes("frontendAppliedGuards"),
    "Canvas image guards must pass stable appliedGuards metadata and backend diagnostics for idempotent guard补缺."
);
check(
    source.includes("function smartDeduplicateUploadReferences") &&
        source.includes("function smartReferenceImageKeyCandidates") &&
        source.includes("function smartReferenceDeduplicationDiagnostics") &&
        source.includes("roles:smartReferenceRoles") &&
        source.includes("sourceNodeIds") &&
        source.includes("sourceReferenceIds") &&
        source.includes("referenceDeduplication:{") &&
        source.includes("mergedGroups"),
    "Same-image reference upload deduplication must merge roles/sources before upload limits and expose diagnostics."
);
check(
    source.includes("function smartApplyProductTruthRetentionAfterLimit") &&
        source.includes("function smartBestProductTruthRetentionReference") &&
        source.includes("function smartLowestPriorityDisplaceableReference") &&
        source.includes("function smartIsProductReplacementUploadScenario") &&
        source.includes("productTruthRetention:resolved.productTruthRetention") &&
        source.includes("retentionApplied") &&
        source.includes("displacedReferenceId"),
    "Product replacement upload limiting must retain one full product truth reference when safe and expose retention diagnostics."
);
check(
    source.includes("const frozenRequest = isFrozenGenerationRequest(prompt) ? prompt : null") &&
        source.includes("uploadReferences:smartCloneReferenceList(frozenRequest.uploadReferences || frozenRequest.referencePreflight?.uploadReferences || [])") &&
        source.includes("const preflight = frozenRequest?.referencePreflight") &&
        source.includes("const generationSpec = frozenRequest?.generationSpec") &&
        !functionSource("runApiGeneration").includes("frozenRequest\n        ? smartResolveFinalReferenceUploads"),
    "runApiGeneration must use frozen reference order, preflight, and generationSpec instead of reselecting references for frozen requests."
);
check(
    source.includes("function consumeGenerationDefaultsAfterTaskCreated") &&
        source.includes("function consumeFrozenPendingGenerationDefaults") &&
        source.includes("frozenGenerationDefaultConsumption") &&
        source.includes("frozenSubmitFailures") &&
        source.includes("retryPayload:item.payload || null") &&
        source.includes("consumeFrozenPendingGenerationDefaults(node, smartLoopContext)") &&
        source.includes("defaultConsumption:item.defaultConsumption || null"),
    "Default reference consumption must move out of buildPromptRequest and happen once after task creation, including retry success."
);
check(
    source.includes("function smartDedupePromptSections") &&
        source.includes("deduplicatedRules") &&
        source.includes("promptBeforeGuard") &&
        source.includes("promptAfterGuard"),
    "Prompt compression must dedupe repeated rules and retain before/after prompt diagnostics."
);
check(
    source.includes("function smartPromptIntegrityCheck") &&
        source.includes("function smartCompressPromptEntries") &&
        source.includes("dropped_atomic_prompt_modules") &&
        source.includes("smartAssertPromptIntegrity(prompt, label)") &&
        backendSource.includes("def compact_complete_prompt_text") &&
        backendSource.includes("def join_complete_prompt_parts") &&
        !backendSource.includes("return compact[:max_len]") &&
        !backendSource.includes("return explicit[:1600]") &&
        !backendSource.includes("return clean[:9000]"),
    "Prompt compression must use atomic boundaries and local integrity validation on frontend and backend prompt assembly."
);
check(
    source.includes("async function smartReferenceContentSha256") &&
        source.includes("crypto.subtle.digest('SHA-256'") &&
        source.includes("smartDataUrlArrayBuffer") &&
        source.includes("response.arrayBuffer()"),
    "Product recognition cache keys must use real image bytes hashed with SHA-256."
);
check(
    source.includes("async function smartProductRecognitionCacheKey") &&
        source.includes("if(!contentKey) return ''") &&
        !source.includes("ref.sha256 || ref.contentSha256 || ref.asset_sha256 || smartHashText(`${ref.url"),
    "Product recognition cache must skip unreliable keys instead of falling back to URL/name/mtime metadata."
);
check(
    source.includes("function smartSelectGenerationReferenceUploads") &&
        source.includes("smartReferenceManualRole") &&
        source.includes("smartReferenceIsPinnedUpload") &&
        source.includes("reference_preflight_matches_request") &&
        source.includes("pinned_reference_overflow_count"),
    "Manual reference roles, pinned uploads, analysis-only flags, and preflight/request parity must affect actual image requests."
);
check(
    source.includes("const SMART_PROVIDER_PROMPT_BUDGETS") &&
        source.includes("function smartProviderPromptBudget") &&
        source.includes("function smartAssertPromptWithinHardBudget") &&
        source.includes("smartAssertPromptWithinHardBudget(finalPrompt"),
    "Provider prompt budgets must have centralized soft/hard limits and block over-hard-limit submissions."
);
check(
    source.includes("function smartPromptRuleType") &&
        source.includes("mergedRuleCounts") &&
        source.includes("deduplicated_rule_types") &&
        source.includes("merged_rule_counts"),
    "Prompt semantic dedupe must record merged rule types and counts."
);
check(
    source.includes("function smartProductFactsPanelHtml") &&
        source.includes("function bindProductFactsPanelControls") &&
        source.includes("function applyRecognizedProductFactsToNode") &&
        source.includes("if(node.productFactsLocked || node.productFactsUserEdited) return") &&
        source.includes("lockedProductFacts"),
    "Product facts must be editable/lockable and automatic recognition must not overwrite locked or user-edited facts."
);
check(
    source.includes("retry_reuse") &&
        source.includes("runContext:true") &&
        source.includes("generationSpec:true") &&
        source.includes("finalPrompt:true") &&
        source.includes("reference_compress_ms:null") &&
        source.includes("request_upload_ms:null"),
    "Retry diagnostics must show reused generation artifacts and unavailable timing splits must not be faked as zero."
);
check(
    backendSource.includes("ALLOWED_LOCAL_ORIGINS") &&
        backendSource.includes('allow_origins=ALLOWED_LOCAL_ORIGINS') &&
        !backendSource.includes('allow_origins=["*"]') &&
        backendSource.includes('uvicorn.run(app, host="127.0.0.1"'),
    "Final regression: local app must not restore wildcard CORS or public default binding."
);
check(
    backendSource.includes('tempfile.mkstemp(prefix=".canvas-"') &&
        backendSource.includes("os.fsync(f.fileno())") &&
        backendSource.includes("shutil.copy2(path, backup_path)") &&
        backendSource.includes("os.replace(tmp_path, path)") &&
        backendSource.includes('backup_path = f"{path}.bak"') &&
        backendSource.includes("def load_canvas_json_with_backup") &&
        backendSource.includes("restore_canvas_file_from_backup(path, backup_path)"),
    "Final regression: canvas saves must use temp file flush/fsync, .bak backup, atomic replace, and .bak recovery."
);

console.log("generation-logic verification: OK");
