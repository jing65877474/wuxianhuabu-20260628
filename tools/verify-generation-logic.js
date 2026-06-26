const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const smartCanvasPath = path.join(root, "static", "js", "smart-canvas.js");
const source = fs.readFileSync(smartCanvasPath, "utf8");
const backendSource = fs.readFileSync(path.join(root, "main.py"), "utf8");
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
    "Poster-copy text lock does not increase visual similarity",
    "product-surface brand marks",
    "poster brand identity elements",
    "BALANCED EDIT-BASE REFERENCE:",
    "LOOSE EDIT-BASE REFERENCE:",
    "generatedEditBase:true",
    "structureLock:true",
    "只更新提示词，不自动生图",
    "filterStaleEmptyRunPlaceholders",
    "meta.sourceNodeId !== targetNode.id",
    "cleanupCaseStyleReferenceInputs",
], "A required generation safeguard is missing.");

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
check(
    canvasListSource.includes("smart-canvas.html?id=${enc}&project=${project}&v=${Date.now()}"),
    "Opening a smart canvas must cache-bust its HTML so the generated-image prompt card cannot remain stale."
);

check(
    /function styleCasePreviewReference\(cases\)\s*\{\s*return null;\s*\}/.test(source),
    "Style matching must not create a case-image reference."
);

const styleUpload = new Function(
    "smartReferenceRoleIsProduct",
    "smartReferenceRoleIsCase",
    "smartReferenceLikelyContainsPerson",
    "smartPosterCopyEnabledForGeneration",
    "smartPosterCopyDisabledForGeneration",
    `${functionSource("smartStyleReferenceShouldUpload")}; return smartStyleReferenceShouldUpload;`
)(
    (ref) => ref?.role === "product_truth_reference" || ref?.role === "product_detail_reference",
    (ref) => ref?.role === "case_style_reference",
    (node, ref) => ref?.containsPerson === true,
    (node) => node?.posterCopyEnabled === true,
    (node) => node?.posterCopyDisabled === true
);

const personReference = { role: "composition_reference", containsPerson: true };
check(styleUpload({}, personReference, 65) === false, "A normal person reference below 85 must remain text-only.");
check(styleUpload({ posterCopyEnabled: true }, personReference, 65) === true, "Poster-copy primary references must upload even below 85.");
check(styleUpload({ posterCopyDisabled: true }, personReference, 65) === true, "Poster-copy disabled primary references must upload at 60+ so layout similarity is preserved.");
check(styleUpload({}, personReference, 85) === true, "A normal person reference at 85 must upload.");
check(styleUpload({}, { role: "product_truth_reference" }, 20) === true, "Product truth must upload at every style weight.");

var uniqueReferenceImages = (refs) => {
    const seen = new Set();
    return (refs || []).filter((ref) => ref && ref.url && !seen.has(ref.url) && seen.add(ref.url));
};
var imageRefsOnly = (refs) => (refs || []).filter((ref) => ref && ref.url && (ref.kind || "image") === "image");
var promptNodeReferenceWeight = (node) => Number(node?.referenceWeight ?? 65);
var smartStyleReferenceShouldUpload = () => false;
var inputNodesFor = () => [];
var isSmartGroupNode = () => false;
var isGeneratedImagePromptComposerNode = (node) => node?.type === "smart-image" && node?.generatedPromptInitialized === true;
var generatedEditBaseSimilarityIntent = () => "balanced_edit_base";

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

function route(refs, weight = 65, nodeExtras = {}) {
    const node = { id: "test-node", referenceWeight: weight, ...nodeExtras };
    const prioritized = smartPrioritizeGenerationReferences(refs);
    const decorated = smartDecorateReferenceWeights(node, prioritized);
    return decorated.filter(smartReferenceUploadAllowed);
}

const mediumPersonWithCase = route([primary, caseRef], 65);
check(mediumPersonWithCase.length === 0, "A 65-weight person reference and its case image must both remain text-only.");

const posterCopyPersonWithProduct = route([primary, product, caseRef], 65, { posterCopyEnabled: true });
check(posterCopyPersonWithProduct.some((ref) => ref.role === "composition_reference" && ref.posterCopyReference && !ref.copyTextLock && ref.inputFidelity === "low"), "Poster-copy primary reference must upload as a lightweight text guide at medium weight.");
check(posterCopyPersonWithProduct.some((ref) => ref.role === "product_truth_reference"), "Poster-copy mode must still keep product truth references.");
const strictPosterCopy = route([primary], 85, { posterCopyEnabled: true });
check(strictPosterCopy.some((ref) => ref.posterCopyReference && ref.copyTextLock && ref.inputFidelity === "high"), "Poster-copy text hard lock should be reserved for 85+ reference weight.");

const posterCopyOffPersonWithProduct = route([primary, product, caseRef], 65, { type: "smart-prompt", posterCopyEnabled: false });
check(
    posterCopyOffPersonWithProduct.some((ref) => ref.role === "composition_reference" && ref.posterCopyDisabledReference && ref.copyTextRemovalOnly && ref.inputFidelity === "high"),
    "Poster-copy disabled primary reference must upload as a high-fidelity layout reference at medium weight."
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
    inheritedPosterRefs[0]?.posterCopyReference === true &&
        inheritedPosterRefs[0]?.copyTextLock !== true &&
        inheritedPosterRefs[0]?.inputFidelity === "low",
    "An inherited medium-weight Poster-copy edit base must stay lightweight instead of forcing OCR-style copy lock."
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

const highPersonWithCase = route([primary, caseRef], 85);
check(highPersonWithCase.length === 1, "At 85+, only the original person/style reference may upload.");
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
check(
    route([nonPersonStyle], 65, { llmInstruction: "背景颜色配色改变一下" }).length === 0,
    "An explicit background/palette change must make a sub-85 style reference text-only."
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
        backendSource.includes("poster_copy_lock") &&
        backendSource.includes("posterCopyReference") &&
        backendSource.includes("strict_structure_lock") &&
        backendSource.includes("ai_ref_has_poster_copy_lock") &&
        backendSource.includes('role in {"product_truth_reference", "product_detail_reference", "mask"}') &&
        !backendSource.includes('structure_lock or poster_copy_lock or input_fidelity == "high"'),
    "Product and strict-structure compression must remain high while Poster-copy alone must not force 1536/high fidelity."
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
        source.includes("Treat the logo/brand strip as a fixed header identity area") &&
        source.includes("brandIdentityPrompt") &&
        backendSource.includes("def gpt_image_reference_limit") &&
        (backendSource.includes("gpt_image_reference_limit(prompt, image_refs)") || backendSource.includes("smartGenerationReferenceLimit")) &&
        backendSource.includes("def style_brand_identity_lock_prompt") &&
        backendSource.includes("BRAND IDENTITY LOCK:") &&
        backendSource.includes("Brand identity is separate from poster copy"),
    "Brand/logo identity must be locked independently from the Poster copy switch."
);
check(
    source.includes("function smartPosterCopyDisabledPrompt") &&
        source.includes("Preserve poster brand identity elements") &&
        source.includes("Do not remove text printed on the product or package itself") &&
        source.includes("Disabling Poster copy is only a poster-text removal control") &&
        backendSource.includes("Preserve product-surface text as product identity") &&
        backendSource.includes("Preserve poster brand identity elements") &&
        backendSource.includes("printed packaging graphics as product identity") &&
        !source.includes("label, logo text, watermark") &&
        !backendSource.includes("label, logo text, watermark"),
    "Poster-copy disabled mode must remove poster overlay copy while preserving product/package labels."
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

console.log("generation-logic verification: OK");
