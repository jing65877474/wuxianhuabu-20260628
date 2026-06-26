const params = new URLSearchParams(location.search);
const canvasId = params.get('id') || '';
const sourceProjectId = params.get('project') || '';
const CANVAS_LIST_PROJECT_KEY = 'canvasListCurrentProjectId';
const shell = document.getElementById('shell');
const world = document.getElementById('world');
const composer = document.getElementById('composer');
const createMenu = document.getElementById('createMenu');
const canvasContextMenu = document.getElementById('canvasContextMenu');
const promptInput = document.getElementById('promptInput');
const mentionPicker = document.getElementById('mentionPicker');
const mentionPreview = document.getElementById('mentionPreview');
const engineSelect = document.getElementById('engineSelect');
const dynamicParams = document.getElementById('dynamicParams');
const runBtn = document.getElementById('runBtn');
const generatedPromptComposer = document.getElementById('generatedPromptComposer');
const cascadeRunBtn = document.getElementById('cascadeRunBtn');
const fileInput = document.getElementById('fileInput');
const apiKindToggle = document.getElementById('apiKindToggle');
const inputThumbsRow = document.getElementById('inputThumbsRow');
const SMART_UPLOAD_MAX = 20;
const SMART_REFERENCE_IMAGE_MAX = 20;
const inputPromptPreview = document.getElementById('inputPromptPreview');
const minimap = document.getElementById('minimap');
const minimapContent = document.getElementById('minimapContent');
const imageEditModal = document.getElementById('imageEditModal');
const smartLogModal = document.getElementById('smartLogModal');
const smartLogList = document.getElementById('smartLogList');
const smartShortcutModal = document.getElementById('smartShortcutModal');
const selectionBox = document.getElementById('selectionBox');
const assetToggle = document.getElementById('assetToggle');
const assetPanel = document.getElementById('assetPanel');
const assetCloseBtn = document.getElementById('assetCloseBtn');
const assetLibrarySelect = document.getElementById('assetLibrarySelect');
const assetCategorySelect = document.getElementById('assetCategorySelect');
const assetGrid = document.getElementById('assetGrid');
const assetDropZone = document.getElementById('assetDropZone');
const assetImageControls = document.getElementById('assetImageControls');
const assetAddCategoryBtn = document.getElementById('assetAddCategoryBtn');
const assetRenameCategoryBtn = document.getElementById('assetRenameCategoryBtn');
const assetDialogBackdrop = document.getElementById('assetDialogBackdrop');
const assetDialogTitle = document.getElementById('assetDialogTitle');
const assetDialogInput = document.getElementById('assetDialogInput');
const assetDialogCancel = document.getElementById('assetDialogCancel');
const assetDialogOk = document.getElementById('assetDialogOk');
const assetHoverPreview = document.getElementById('assetHoverPreview');
const promptPresetPanel = document.getElementById('promptPresetPanel');
const promptPresetClose = document.getElementById('promptPresetClose');
const promptPresetStatus = document.getElementById('promptPresetStatus');
const promptPresetSelect = document.getElementById('promptPresetSelect');
const promptPresetName = document.getElementById('promptPresetName');
const promptPresetText = document.getElementById('promptPresetText');
const promptPresetApply = document.getElementById('promptPresetApply');
const promptPresetDelete = document.getElementById('promptPresetDelete');
const promptPresetNew = document.getElementById('promptPresetNew');
const promptPresetSave = document.getElementById('promptPresetSave');
const promptTemplatePanel = document.getElementById('promptTemplatePanel');
const promptTemplateClose = document.getElementById('promptTemplateClose');
const promptTemplateSearch = document.getElementById('promptTemplateSearch');
const promptTemplateLibrarySelect = document.getElementById('promptTemplateLibrarySelect');
const promptTemplateCats = document.getElementById('promptTemplateCats');
const promptTemplateBody = document.getElementById('promptTemplateBody');
const composerTemplateBtn = document.getElementById('composerTemplateBtn');
const composerPromptMatchBtn = document.getElementById('composerPromptMatchBtn');
let minimapViewport = document.getElementById('minimapViewport');
let canvas = null;
let canvasUsesConnections = true;
let nodes = [];
let selectedId = '';
let selectedIds = [];
let selectedImage = {nodeId:'', index:-1};
let dragState = null;
let loopInsertPreview = null;
let selectionState = null;
let smartGenerationPreflightOpen = false;
let smartGenerationSubmitting = false;
let isRKeyDown = false;
let isSpaceKeyDown = false;
let selectionJustFinished = false;
let contextMenuPoint = null;
let resizeState = null;
let llmInstructionResizeState = null;
let promptSplitResizeState = null;
let thumbDragState = null;
let uploadTargetId = '';
let pendingGroupUploadPoint = null;
let mentionRange = null;
let mentionAnchorEl = null;
let mentionInsertMode = 'token';
let panState = null;
let didPan = false;
let portDragState = null;
let saveTimer = null;
let apiProviders = [];
let assetLibrary = {categories:[]};
let assetLibraryOpen = false;
let assetTab = 'image';
let activeAssetCategoryId = '';
let activeAssetLibraryId = '';
const LOCAL_ASSET_LIBRARY_ID = '__local_assets__';
let localAssetLibrary = {items:[], tree:null};
let activeLocalAssetFolderId = '__root__';
let mentionSource = 'input';
let mentionAssetCategoryId = '';
let assetLibraryUpdatedAt = 0;
let assetLibraryRefreshTimer = null;
let activeAssetSmartClassId = '';
const ASSET_SMART_CATEGORY_PREFIX = '__smart_class__::';
const PROMPT_PRESETS_KEY = 'smart_canvas_prompt_presets_v1';
const PROMPT_TEMPLATE_GROUPS_KEY = 'smart_canvas_prompt_template_groups_v1';
const PROMPT_TEMPLATE_OVERRIDES_KEY = 'smart_canvas_prompt_template_overrides_v1';
let promptPresets = [];
let builtinPromptTemplates = [];
let promptLibraries = [];
let activePromptLibraryId = 'system';
const STYLE_PROMPT_LIBRARY_ID = 'gpt_image_2_style_library';
let promptStyleSearchTimer = null;
let promptStyleSearchToken = 0;
let promptTemplateGroups = [];
let promptTemplateOverrides = {hiddenBuiltinIds:[], editedBuiltins:{}};
let promptTemplateCategory = 'all';
let promptTemplateSelectedId = '';
let promptTemplateEditing = false;
let promptTemplateGroupEditMode = false;
let promptPresetDeleteArmed = false;
let createMenuPoint = {x:0, y:0};
let createMenuGroupId = '';
let nodeClipboard = null;
let imageClipboard = null;
const SMART_CANVAS_NODE_CLIPBOARD_FORMAT = 'infinite-smart-canvas-node-clipboard';
let imageClickTimer = null;
let suppressImageClickUntil = 0;
let lastMouseWorld = null;
let lastConfigRefreshAt = 0;
let smartMinimapState = null;
let smartMinimapDrag = false;
let zoomPreviewState = null;
let runTimerInterval = null;
let smartCascadeRunning = false;
let smartCascadeActiveLoopId = '';
let smartCascadeStopRequested = false;
let smartCascadeSilentSelection = false;
let smartCascadeRunPath = null;
const smartCascadeRuns = new Map();
let smartLoopContext = null;
let transientSmartCloudLinks = [];
let runBtnCooldownToken = 0;
let composerPromptMatching = false;
let smartRunStateToken = 0;
const activeSmartTaskPolls = new Map();
const cancelledSmartTaskIds = new Set();
const deletedSmartNodeTombstones = new Map();
const smartNodeRunTokens = new Map();
let lastImagePasteAt = 0;
let lastNodePasteAt = 0;
let suppressNodeClickUntil = 0;
let textSelectionGuard = null;
const UNDO_LIMIT = 40;
const undoStack = [];
let undoSuppressed = false;
let pendingUndoSnapshot = null;
function activeSmartCascadeCount(){ return smartCascadeRuns.size; }
function smartCascadeRunForLoop(loopId){ return loopId ? smartCascadeRuns.get(loopId) || null : null; }
function smartCascadeIsLoopRunning(loopId){ return Boolean(smartCascadeRunForLoop(loopId)); }
function syncSmartCascadeLegacyState(preferredLoopId=''){
    const activeIds = [...smartCascadeRuns.keys()];
    smartCascadeRunning = activeIds.length > 0;
    smartCascadeActiveLoopId = preferredLoopId && smartCascadeRuns.has(preferredLoopId)
        ? preferredLoopId
        : (activeIds[0] || '');
    const activeRun = smartCascadeActiveLoopId ? smartCascadeRuns.get(smartCascadeActiveLoopId) : null;
    smartCascadeStopRequested = Boolean(activeRun?.stopRequested);
    smartCascadeRunPath = activeRun?.runPath || null;
}
function smartCascadeAnyRunning(){ return smartCascadeRunning || activeSmartCascadeCount() > 0; }
function smartCascadeEdgeState(edgeKey){
    for(const run of smartCascadeRuns.values()){
        const state = run?.runPath?.states?.[edgeKey];
        if(state) return state;
    }
    return smartCascadeRunPath?.states?.[edgeKey] || '';
}
function smartCascadePathForCtx(ctx=null){
    return ctx?.runState?.runPath || ctx?.runPath || smartCascadeRunPath;
}
function capturePendingUndo(){ pendingUndoSnapshot = snapshotForUndo(); }
function commitPendingUndo(){
    if(pendingUndoSnapshot){
        undoStack.push(pendingUndoSnapshot);
        if(undoStack.length > UNDO_LIMIT) undoStack.shift();
        pendingUndoSnapshot = null;
    }
}
function discardPendingUndo(){ pendingUndoSnapshot = null; }
function snapshotForUndo(){
    return {
        nodes: JSON.parse(JSON.stringify(nodes)),
        connections: JSON.parse(JSON.stringify(canvas?.connections || [])),
        selectedId,
        selectedIds: selectedIds.slice(),
        selectedImage: {...selectedImage}
    };
}
function pushUndo(){
    if(undoSuppressed) return;
    if(!canvas) return;
    undoStack.push(snapshotForUndo());
    if(undoStack.length > UNDO_LIMIT) undoStack.shift();
}
function performUndo(){
    if(!undoStack.length){ toast(tr('smart.toastNoUndo')); return; }
    const snap = undoStack.pop();
    undoSuppressed = true;
    nodes = snap.nodes;
    if(canvas) canvas.connections = snap.connections;
    selectedId = snap.selectedId;
    selectedIds = snap.selectedIds;
    selectedImage = snap.selectedImage;
    activeComposerSubject = null;
    lastComposerNodeId = '';
    render();
    scheduleSave();
    undoSuppressed = false;
    toast(tr('smart.toastUndone'));
}
let cropState = null;
let cropDrag = null;
let imageEditMode = 'crop';
let imageEditModeTouched = false;
let editDrawState = null;
let editTextItems = [];
let editTextSelectedId = '';
let editTextDrag = null;
let editTextDirty = false;
let editTextInlineEditor = null;
let editDrawUndoStack = [];
let editDrawRedoStack = [];
const EDIT_DRAW_HISTORY_MAX = 40;
let brushTool = 'free';
let brushLabelCounter = 1;
let gridCustomMode = false;
let gridCustomLines = [];
let gridCustomOrientation = 'h';
let gridCustomHistory = [];
let gridCustomDrag = null;
let gridOperationMode = 'split';
let gridJoinLayout = null;
let gridJoinDrag = null;
let gridJoinImageCache = new Map();
let gridJoinUserMoved = false;
let gridJoinOutputSize = 2048;
// 非空时表示当前宫格拼接的数据源是整个分组（聚合组内所有图片成员），而不是单个节点。
let gridJoinGroupId = '';
let imageEditZoom = 1.0;
let imageEditBaseW = 0;
let imageEditBaseH = 0;
let previewZoom = 1.0;
let previewPan = {x:0, y:0};
let previewPanDrag = null;
let previewCompareDrag = false;
let previewComparePos = 50;
let imageEditPanDrag = null;
let previewNavState = {nodeId:'', index:0, count:0};
const PANORAMA_RATIO_PRESETS = {
    square:{w:1, h:1},
    portrait:{w:2, h:3},
    landscape:{w:3, h:2},
    portrait43:{w:3, h:4},
    landscape43:{w:4, h:3},
    story:{w:9, h:16},
    wide:{w:16, h:9},
    ultrawide:{w:21, h:9},
    ultratall:{w:9, h:21}
};
let panoramaState = {
    enabled:false,
    ratio:'wide',
    customW:16,
    customH:9,
    fov:75,
    yaw:0,
    pitch:0,
    drag:null,
    three:null,
    renderer:null,
    scene:null,
    camera:null,
    sphere:null,
    texture:null,
    threeLoadPromise:null,
    image:null,
    ctx:null,
    animationId:0,
    loadedSrc:'',
    loadToken:0
};
window.__smartCanvasPanoramaState = panoramaState;
let viewport = {x:0, y:0, scale:1};
let settings = {
    engine:'api',
    apiKind:'image',
    provider_id:'',
    model:'',
    ratio:'square',
    resolution:'auto',
    customRatio:'',
    customRatioWidth:'',
    customRatioHeight:'',
    customSize:'',
    customWidth:'',
    customHeight:'',
    quality:'auto',
    count:1,
    videoProvider:'',
    videoModel:'',
    videoDuration:5,
    videoAspect:'16:9',
    videoResolution:'',
    videoEnhancePrompt:false,
    videoEnableUpsample:false,
    videoWatermark:false,
    videoCameraFixed:false,
    videoGenerateAudio:false,
    videoMultimodal:true,
    _videoMultimodalUserSet:false,
    videoUseFrameRoles:false,
    videoTrustedAsset:false,
    videoTrustedSource:'library',
    videoTempShLinks:[],
    msgenModel:'zimage',
    msCustomModel:'',
    msRatio:'square',
    msResolution:'1k',
    msCustomRatio:'',
    msCustomRatioWidth:'',
    msCustomRatioHeight:'',
    msCustomSize:'',
    msCustomWidth:'',
    msCustomHeight:'',
    width:1024,
    height:1024,
    enhanceStrength:0.5,
    enhanceUpscale:false,
    enhanceUpscaleRes:2048,
    editUpscale:false,
    editUpscaleRes:2048,
    promptH:124
};
const MS_GEN_MODELS = {
    zimage: { label:'ZImage', modelId:'Tongyi-MAI/Z-Image-Turbo', supportsImage:false, endpoint:'/generate' },
    qwen_edit: { label:'Qwen Edit', modelId:'Qwen/Qwen-Image-Edit-2511', supportsImage:true, endpoint:'/api/angle/generate' },
    klein_edit: { label:'Klein', modelId:'black-forest-labs/FLUX.2-klein-9B', supportsImage:true, endpoint:'/api/ms/generate' },
    custom: { label:tr('smart.custom') || '自定义', modelId:'', acceptsImage:true, endpoint:'/api/ms/generate' }
};
const SIZE_MAP = {
    square: {'1k':'1024x1024','2k':'2048x2048','4k':'4096x4096'},
    landscape: {'1k':'1536x1024','2k':'2048x1360','4k':'3520x2336'},
    portrait: {'1k':'1024x1536','2k':'1360x2048','4k':'2336x3520'},
    landscape43: {'1k':'1024x768','2k':'2048x1536','4k':'3312x2480'},
    portrait43: {'1k':'768x1024','2k':'1536x2048','4k':'2480x3312'},
    wide: {'1k':'1536x864','2k':'2048x1152','4k':'3840x2160'},
    story: {'1k':'864x1536','2k':'1152x2048','4k':'2160x3840'},
    ultrawide: {'1k':'1536x656','2k':'2048x880','4k':'3840x1648'},
    ultratall: {'1k':'656x1536','2k':'880x2048','4k':'1648x3840'}
};
const RES_LONG_SIDE = { '1k':1024, '2k':2048, '4k':3840 };
const RES_PIXEL_LIMIT = { '1k':2359296, '2k':4194304, '4k':8294400 };
function tr(key){ return window.StudioI18n?.t ? window.StudioI18n.t(key) : key; }
function trf(key, values={}){
    return Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), tr(key));
}
function refreshIcons(){ if(window.lucide) lucide.createIcons(); }
function uid(prefix){ return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`; }
function escapeHtml(str){ return String(str == null ? '' : str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
const escapeAttr = escapeHtml;
function smartOriginalMediaUrl(itemOrUrl){
    const raw = typeof itemOrUrl === 'string' ? itemOrUrl : (itemOrUrl?.url || '');
    const text = String(raw || '');
    if(!text) return '';
    try {
        const parsed = new URL(text, window.location.origin);
        if(parsed.pathname === '/api/media-preview'){
            const original = parsed.searchParams.get('url') || '';
            return original || text;
        }
    } catch(e) {}
    return text;
}
function smartMediaPreviewUrl(itemOrUrl, size=512){
    const raw = smartOriginalMediaUrl(itemOrUrl);
    const displayItem = typeof itemOrUrl === 'object' && itemOrUrl ? {...itemOrUrl, url:raw} : raw;
    const displayUrl = displayMediaUrl(displayItem);
    if(!raw || raw.startsWith('data:') || raw.startsWith('blob:')) return displayUrl;
    if(!raw.startsWith('/output/') && !raw.startsWith('/assets/')) return displayUrl;
    if(!/\.(png|jpe?g|webp|gif|bmp|avif|tiff?|mp4|webm|mov|m4v|avi|mkv)(\?|#|$)/i.test(raw)) return displayUrl;
    const width = Math.max(64, Math.min(2048, Math.round(Number(size) || 512)));
    return `/api/media-preview?w=${width}&url=${encodeURIComponent(raw)}`;
}
function smartPreviewImgHtml(itemOrUrl, size=512, attrs=''){
    const original = smartOriginalMediaUrl(itemOrUrl);
    const preview = smartMediaPreviewUrl(itemOrUrl, size);
    return `<img src="${escapeHtml(preview)}" data-preview-src="${escapeAttr(preview)}" data-original-src="${escapeAttr(original)}"${attrs ? ` ${attrs}` : ''}>`;
}
function loadSmartOriginalImageDimensions(url){
    const src = displayMediaUrl({url:smartOriginalMediaUrl(url)});
    if(!src || /^data:/i.test(src) || /^blob:/i.test(src)) return Promise.resolve(null);
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img.naturalWidth && img.naturalHeight ? {w:img.naturalWidth, h:img.naturalHeight} : null);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}
function smartVideoPreviewHtml(itemOrUrl, size=512, attrs=''){
    const original = smartOriginalMediaUrl(itemOrUrl);
    const preview = smartMediaPreviewUrl(itemOrUrl, size);
    return `<img src="${escapeHtml(preview)}" data-preview-src="${escapeAttr(preview)}" data-original-src="${escapeAttr(original)}" data-url="${escapeAttr(original)}" data-preview-kind="video"${attrs ? ` ${attrs}` : ''}>`;
}
function smartVideoFallbackHtml(url, attrs=''){
    const original = smartOriginalMediaUrl(url);
    const src = displayMediaUrl({url:original});
    return `<video src="${escapeHtml(src)}" data-url="${escapeAttr(original)}" muted preload="metadata" playsinline disablepictureinpicture controlslist="nodownload noplaybackrate noremoteplayback"${attrs ? ` ${attrs}` : ''}></video>`;
}
function smartVideoPlayerHtml(url, attrs=''){
    const original = smartOriginalMediaUrl(url);
    const safe = escapeHtml(displayMediaUrl({url:original}));
    return `<video src="${safe}" data-url="${escapeAttr(original)}" data-inline-video-active="1" controls autoplay playsinline preload="metadata" disablepictureinpicture controlslist="nodownload noplaybackrate noremoteplayback"${attrs ? ` ${attrs}` : ''}></video>`;
}
function smartActivateVideoPreview(target){
    const root = target?.closest?.('.media-video-card,.video-thumb,.image-wrap,.thumb-item') || target?.parentElement || null;
    const img = target?.matches?.('img[data-preview-kind="video"]') ? target : root?.querySelector?.('img[data-preview-kind="video"]');
    if(!img){
        const fallback = target?.matches?.('video[data-url]') ? target : root?.querySelector?.('video[data-url]');
        if(fallback){
            fallback.controls = true;
            fallback.muted = false;
            fallback.play?.().catch(() => {});
            return true;
        }
        return false;
    }
    const original = smartOriginalMediaUrl(img.dataset.originalSrc || img.dataset.url || img.getAttribute('src') || '');
    if(!original) return false;
    const itemEl = target?.closest?.('[data-image-index]') || root?.closest?.('[data-image-index]') || root;
    const nodeEl = target?.closest?.('.image-node') || root?.closest?.('.image-node');
    const node = nodes.find(n => n.id === nodeEl?.dataset.id);
    const imageIndex = Number(itemEl?.dataset?.imageIndex ?? 0);
    const image = node?.images?.[imageIndex];
    if(image) image._inlineVideoActive = true;
    const tpl = document.createElement('template');
    tpl.innerHTML = smartVideoPlayerHtml(original);
    const video = tpl.content.firstElementChild;
    if(!video) return false;
    img.replaceWith(video);
    video.parentElement?.querySelector?.('.smart-video-play')?.style?.setProperty('display', 'none');
    video.addEventListener('ended', () => {
        if(image) image._inlineVideoActive = true;
        video.dataset.inlineVideoActive = '1';
    });
    video.play?.().catch(() => {});
    return true;
}
function isSmartPreviewImage(img){
    return img?.tagName?.toLowerCase?.() === 'img'
        && img.dataset?.previewSrc
        && img.dataset?.originalSrc
        && img.dataset.previewSrc !== img.dataset.originalSrc
        && img.getAttribute('src') !== img.dataset.originalSrc;
}
function bindSmartPreviewImageFallbacks(root=document){
    root.querySelectorAll?.('img[data-preview-src][data-original-src]:not([data-preview-fallback-bound])').forEach(img => {
        img.dataset.previewFallbackBound = '1';
        img.addEventListener('error', () => {
            const original = img.dataset.originalSrc || '';
            if(img.dataset.previewKind === 'video'){
                const tpl = document.createElement('template');
                tpl.innerHTML = smartVideoFallbackHtml(original, img.dataset.videoFallbackAttrs || '');
                img.replaceWith(tpl.content.firstElementChild);
                return;
            }
            if(original && img.getAttribute('src') !== original) img.src = original;
        });
    });
}
function cloneSmartSettings(source=settings){
    try {
        return JSON.parse(JSON.stringify(source || {}));
    } catch(e) {
        return {...(source || {})};
    }
}
const DEPRECATED_SMART_GENERATION_PROVIDER_IDS = new Set(['comfy', 'comfyui', 'runninghub', 'rh']);
function isDeprecatedSmartGenerationProvider(value){
    return DEPRECATED_SMART_GENERATION_PROVIDER_IDS.has(String(value || '').trim().toLowerCase());
}
function stripDeprecatedSmartGenerationSettings(target){
    /* 仅用于读取和迁移旧版画布数据：清理 ComfyUI、RunningHub 和旧版生图工作流字段，避免旧画布恢复已移除供应商。 */
    if(!target || typeof target !== 'object') return target;
    if(isDeprecatedSmartGenerationProvider(target.engine) || isDeprecatedSmartGenerationProvider(target.provider_id) || isDeprecatedSmartGenerationProvider(target.providerId)){
        target.engine = 'api';
        if(isDeprecatedSmartGenerationProvider(target.provider_id)) target.provider_id = '';
        if(isDeprecatedSmartGenerationProvider(target.providerId)) target.providerId = '';
    }
    [
        'comfyMode','comfyWorkflow','comfyParams','comfyRandomActive','comfy_workflow','comfy_params','workflow_json','workflow',
        'rhConfigKey','rhPayment','rhInstanceType','rhParams','rhRandomActive','runninghubApiKey','runninghubBaseUrl','runninghubWorkflowId',
        'runninghubWorkflowJson','runninghubNodeMapping','runninghubTaskId','runninghubModel','workflowId','workflowJson','workflowName',
        'workflowInputs','workflowOutputs','workflowNodes','workflowTaskId','workflowHistory','inputNodeMapping','outputNodeMapping'
    ].forEach(key => delete target[key]);
    return target;
}
function markDeprecatedSmartProviderIfNeeded(node){
    /* 仅用于读取和迁移旧版画布数据：旧供应商节点允许打开和删除，但不能再次提交任务。 */
    const candidates = [node?.engine, node?.provider, node?.provider_id, node?.providerId, node?.runSettings?.engine, node?.runSettings?.provider_id, node?.runSettings?.providerId];
    const removed = candidates.some(isDeprecatedSmartGenerationProvider) || Boolean(node?.comfyWorkflow || node?.rhConfigKey || node?.workflowId || node?.workflowJson);
    if(removed){
        node.deprecatedProviderRemoved = true;
        node.removedProviderMessage = '\u8be5\u8282\u70b9\u5bf9\u5e94\u7684\u4f9b\u5e94\u5546\u5df2\u88ab\u79fb\u9664';
    }
    if(node?.runSettings) stripDeprecatedSmartGenerationSettings(node.runSettings);
    stripDeprecatedSmartGenerationSettings(node);
    return removed;
}
function smartNodeUsesRemovedProvider(node){
    return Boolean(node?.deprecatedProviderRemoved || node?.removedProviderMessage);
}
function settingsForStorage(source=settings){
    const clean = stripDeprecatedSmartGenerationSettings(cloneSmartSettings(source));
    clean.videoTempShLinks = (clean.videoTempShLinks || []).filter(item => item?.manual === true);
    return clean;
}
function normalizeSmartVideoModeSettings(target, preferMultimodal=false){
    if(!target || typeof target !== 'object') return target;
    target.videoUseFrameRoles = Boolean(target.videoUseFrameRoles);
    if(preferMultimodal && !target.videoUseFrameRoles && target._videoMultimodalUserSet !== true) target.videoMultimodal = true;
    else target.videoMultimodal = Boolean(target.videoMultimodal);
    if(target.videoUseFrameRoles) target.videoMultimodal = false;
    return target;
}
function isApiLikeEngine(engine){
    return ['api', 'volcengine'].includes(String(engine || '').toLowerCase());
}
function isGptImageAutoSizeModel(model){
    const raw = String(model || '').trim().toLowerCase();
    const normalized = raw.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const compact = raw.replace(/[^a-z0-9]+/g, '');
    return normalized === 'gpt-image-2'
        || normalized.startsWith('gpt-image-2-')
        || normalized.endsWith('-gpt-image-2')
        || normalized.includes('-gpt-image-2-')
        || compact === 'gptimage2'
        || compact.startsWith('gptimage2')
        || compact.endsWith('gptimage2');
}
function defaultSmartApiResolution(model){
    return isGptImageAutoSizeModel(model) ? 'auto' : '1k';
}
function mediaItemForStorage(item){
    if(!item || typeof item !== 'object') return item;
    const clean = {...item};
    delete clean.cloudUrl;
    delete clean.uploadedUrl;
    delete clean.originalRemoteUrl;
    delete clean.tempCloudUrl;
    delete clean._inlineVideoActive;
    return clean;
}
function canvasForStorage(){
    const clean = JSON.parse(JSON.stringify(canvas || {}));
    clean.settings = settingsForStorage(canvasDefaultSmartSettings || initialSmartSettings);
    // 日志预览的临时节点（编辑器打开期间临时塞进 nodes）绝不能被持久化，否则刷新后会留下幽灵节点。
    if(Array.isArray(clean.nodes)) clean.nodes = clean.nodes.filter(node => node.id !== SMART_LOG_PREVIEW_NODE_ID);
    const filtered = filterTransientUploadPlaceholders(clean.nodes || [], clean.connections || []);
    clean.nodes = filtered.nodes;
    clean.connections = filtered.connections;
    (clean.nodes || []).forEach(node => {
        if(Array.isArray(node.images)) node.images = node.images.map(mediaItemForStorage);
        if(node.runSettings) node.runSettings = settingsForStorage(node.runSettings);
    });
    return clean;
}
function apiErrorMessage(data, fallback='请求失败'){
    if(!data) return fallback;
    if(typeof data === 'string') return data || fallback;
    const detail = data.detail ?? data.error ?? data.message;
    if(typeof detail === 'string') return detail || fallback;
    if(Array.isArray(detail)){
        const messages = detail.map(item => {
            if(typeof item === 'string') return item;
            const loc = Array.isArray(item?.loc) ? item.loc.filter(x => x !== 'body').join('.') : '';
            const msg = item?.msg || item?.message || JSON.stringify(item);
            return loc ? `${loc}: ${msg}` : msg;
        }).filter(Boolean);
        return messages.join('\n') || fallback;
    }
    if(detail && typeof detail === 'object') return detail.message || detail.msg || JSON.stringify(detail);
    try {
        return JSON.stringify(data);
    } catch(e) {
        return fallback;
    }
}
async function responseErrorMessage(response, fallback='请求失败'){
    try {
        const data = await response.clone().json();
        return apiErrorMessage(data, fallback);
    } catch(e) {
        try {
            const text = await response.text();
            return text || fallback;
        } catch(_) {
            return fallback;
        }
    }
}
function downloadBlob(blob, filename){
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'smart-canvas-export.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 800);
}
const RECENT_SMART_SETTINGS_KEY = 'smart_canvas_recent_run_settings_v1';
const initialSmartSettings = cloneSmartSettings(settings);
let canvasDefaultSmartSettings = cloneSmartSettings(settings);
let recentSmartSettingsByMode = {};
function normalizeSmartEngine(value){
    const engine = String(value || '').trim().toLowerCase();
    return ['api','volcengine','modelscope'].includes(engine) ? engine : 'api';
}
function smartSettingsModeKey(source=settings){
    const engine = normalizeSmartEngine(source?.engine);
    if(engine === 'api') return `api:${source?.apiKind === 'video' ? 'video' : 'image'}`;
    if(engine === 'volcengine') return `volcengine:${source?.apiKind === 'video' ? 'video' : 'image'}`;
    return 'modelscope';
}
function loadRecentSmartSettings(){
    try {
        const data = JSON.parse(localStorage.getItem(RECENT_SMART_SETTINGS_KEY) || '{}');
        recentSmartSettingsByMode = data && typeof data === 'object' ? data : {};
    } catch(e) {
        recentSmartSettingsByMode = {};
    }
}
function saveRecentSmartSettings(){
    localStorage.setItem(RECENT_SMART_SETTINGS_KEY, JSON.stringify(recentSmartSettingsByMode));
}
function recentSmartSettingsForMode(modeKey=''){
    const key = modeKey || recentSmartSettingsByMode.__lastKey || smartSettingsModeKey(settings);
    const saved = recentSmartSettingsByMode[key];
    return saved && typeof saved === 'object' ? cloneSmartSettings(saved) : {};
}
function rememberRecentSmartSettings(source=settings, node=null){
    const clean = stripOutpaintDisplaySettings(settingsForStorage(source), node);
    sanitizeSmartApiSelection(clean);
    if(clean.outpaintResolutionLocked === true && clean.resolution === 'custom'){
        clean.resolution = '1k';
        clean.ratio = clean.ratio || 'square';
        clean.customWidth = '';
        clean.customHeight = '';
        clean.customSize = '';
    }
    delete clean.outpaintResolutionLocked;
    const key = smartSettingsModeKey(clean);
    recentSmartSettingsByMode[key] = settingsForStorage(clean);
    recentSmartSettingsByMode.__lastKey = key;
    saveRecentSmartSettings();
}
function applyRecentSmartSettingsForCurrentMode(){
    const requestedEngine = normalizeSmartEngine(settings.engine);
    const requestedApiKind = settings.apiKind === 'video' ? 'video' : 'image';
    const key = smartSettingsModeKey(settings);
    const saved = recentSmartSettingsForMode(key);
    if(!Object.keys(saved).length){
        settings.engine = requestedEngine;
        if(isApiLikeEngine(requestedEngine)) settings.apiKind = requestedApiKind;
        clearVolcengineSelectionOutsideVolcengine(settings);
        sanitizeSmartApiSelection(settings);
        return;
    }
    settings = {...settings, ...saved, engine:requestedEngine};
    if(isApiLikeEngine(requestedEngine)) settings.apiKind = requestedApiKind;
    clearVolcengineSelectionOutsideVolcengine(settings);
    sanitizeSmartApiSelection(settings);
}
function clearVolcengineSelectionOutsideVolcengine(target=settings){
    if(!target || typeof target !== 'object' || target.engine === 'volcengine') return target;
    if(target.provider_id === 'volcengine') target.provider_id = '';
    if(target.videoProvider === 'volcengine') target.videoProvider = '';
    return target;
}
function isSmartImageNode(node){
    return Boolean(node && (node.type === 'smart-image' || !node.type));
}
function isSmartGroupNode(node){
    return Boolean(node && node.type === 'smart-group');
}
function isSmartFrameGroup(node){
    return Boolean(isSmartGroupNode(node) && node.groupMode === 'frame');
}
function clearSmartNodeExplicitSize(node){
    if(!node || isSmartFrameGroup(node)) return;
    delete node.w;
    delete node.h;
}
function isSmartRunnableNode(node){
    return Boolean(isSmartImageNode(node) || isSmartGroupNode(node));
}
function isHistoryGroupNode(node){
    return Boolean(isSmartImageNode(node) && (node.isHistoryGroup || node.historyFor));
}
function normalizeSmartImageMode(mode){
    return 'self';
}
function smartImageMode(node){
    return 'self';
}
function setSmartImageMode(node, mode){
    if(!isSmartImageNode(node)) return;
    delete node.imageMode;
}
function smartImageUsesWorkflowInput(node, ctx=smartLoopContext){
    return Boolean(isSmartImageNode(node) && ctx?.forceWorkflow);
}
function normalizeLegacySmartNode(node){
    if(!node || typeof node !== 'object') return node;
    if(node.type === 'smart-container'){
        const fallbackImage = node.inputImage?.url ? stripImageGenerationMeta({
            url:node.inputImage.url,
            name:node.inputImage.name || 'image',
            kind:node.inputImage.kind || mediaKindForItem(node.inputImage),
            natural_w:Number(node.inputImage.natural_w || 0),
            natural_h:Number(node.inputImage.natural_h || 0)
        }) : null;
        const images = Array.isArray(node.images) && node.images.length
            ? node.images
            : (fallbackImage ? [fallbackImage] : []);
        const normalized = {
            ...node,
            type:'smart-image',
            title:images.length > 1 ? 'Group' : (images.length ? 'Image' : tr('smart.createImportNode')),
            images
        };
        delete normalized.imageMode;
        delete normalized.inputImage;
        delete normalized.steps;
        delete normalized.resultGrouping;
        return normalized;
    }
    if(!node.type) node.type = 'smart-image';
    markDeprecatedSmartProviderIfNeeded(node);
    if(node.type === 'smart-image') delete node.imageMode;
    if(node.type === 'smart-image' && node.historyFor) node.isHistoryGroup = true;
    return node;
}
function validOutpaintSize(node){
    const w = Math.round(Number(node?.outpaintSize?.width || 0));
    const h = Math.round(Number(node?.outpaintSize?.height || 0));
    return w > 0 && h > 0 ? {width:w, height:h} : null;
}
function parseSizePair(value){
    const match = String(value || '').match(/(\d+)\s*x\s*(\d+)/i);
    return match ? {width:Number(match[1]), height:Number(match[2])} : null;
}
function nearestFourKSizeFor(width, height){
    const w = Math.max(1, Number(width) || 1);
    const h = Math.max(1, Number(height) || 1);
    const ratio = w / h;
    let best = null;
    Object.entries(SIZE_MAP).forEach(([key, values]) => {
        const size = parseSizePair(values?.['4k']);
        if(!size) return;
        const score = Math.abs(Math.log(ratio / (size.width / size.height)));
        if(!best || score < best.score) best = {...size, key, score};
    });
    return best;
}
function exceedsFourKStandard(width, height){
    const standard = nearestFourKSizeFor(width, height);
    if(!standard) return false;
    return Number(width) > standard.width || Number(height) > standard.height;
}
function withOutpaintDisplaySettings(node, baseSettings){
    const size = validOutpaintSize(node);
    if(!size) return baseSettings;
    const engine = normalizeSmartEngine(baseSettings?.engine);
    const next = {
        ...baseSettings,
        resolution:'custom',
        ratio:'',
        customWidth:size.width,
        customHeight:size.height,
        customSize:`${size.width}x${size.height}`,
        outpaintResolutionLocked:true
    };
    if(isApiLikeEngine(engine)) next.apiKind = 'image';
    if(engine === 'modelscope'){
        next.msResolution = 'custom';
        next.msRatio = '';
        next.msCustomWidth = size.width;
        next.msCustomHeight = size.height;
        next.msCustomSize = `${size.width}x${size.height}`;
    }
    return next;
}
function stripOutpaintDisplaySettings(settingsObj, node=null){
    const clean = cloneSmartSettings(settingsObj);
    const size = validOutpaintSize(node);
    const matchesOutpaintSize = size && clean.resolution === 'custom' && String(clean.customSize || '') === `${size.width}x${size.height}`;
    if(matchesOutpaintSize){
        clean.resolution = '1k';
        clean.ratio = clean.ratio || 'square';
        clean.customWidth = '';
        clean.customHeight = '';
        clean.customSize = '';
    }
    const matchesMsOutpaintSize = size && clean.msResolution === 'custom' && String(clean.msCustomSize || '') === `${size.width}x${size.height}`;
    if(matchesMsOutpaintSize){
        clean.msResolution = '1k';
        clean.msRatio = clean.msRatio || 'square';
        clean.msCustomWidth = '';
        clean.msCustomHeight = '';
        clean.msCustomSize = '';
    }
    if(size && Number(clean.width) === size.width && Number(clean.height) === size.height){
        clean.width = 1024;
        clean.height = 1024;
    }
    delete clean.outpaintResolutionLocked;
    return clean;
}
function smartSettingsForNode(node){
    const nodeSettings = stripOutpaintDisplaySettings(node?.runSettings || {}, node);
    const recentSettings = Object.keys(nodeSettings).length ? {} : recentSmartSettingsForMode();
    const base = {
        ...cloneSmartSettings(canvasDefaultSmartSettings || initialSmartSettings),
        ...recentSettings,
        ...nodeSettings
    };
    normalizeSmartVideoModeSettings(base, true);
    return withOutpaintDisplaySettings(node, base);
}
function activeSettingsSubject(){
    const active = activeComposerSubject?.id
        ? (nodes.find(n => n.id === activeComposerSubject.id) || activeComposerSubject)
        : selectedNode();
    return isSmartRunnableNode(active) ? active : null;
}
function activeComposerNode(){
    if(!lastComposerNodeId) return null;
    const id = String(lastComposerNodeId).split(':')[0] || '';
    const node = nodes.find(n => n.id === id);
    return isSmartRunnableNode(node) ? node : null;
}
function persistActiveSmartSettings(){
    if(!composer?.classList?.contains('open')) return;
    const subject = activeComposerNode();
    if(!subject) return;
    subject.runSettings = settingsForStorage(settings);
    rememberRecentSmartSettings(settings, subject);
}
function rememberCanvasListProject(projectId){
    const pid = projectId || 'default';
    try { localStorage.setItem(CANVAS_LIST_PROJECT_KEY, pid); } catch(e){}
    return pid;
}
function canvasListUrlForProject(projectId){
    const pid = rememberCanvasListProject(projectId);
    return `/static/canvas-list.html?project=${encodeURIComponent(pid)}`;
}
function backToCanvasList(){
    savePromptDraftForCurrent();
    window.location.href = canvasListUrlForProject(canvas?.project || sourceProjectId || 'default');
}
function promptPlainText(){
    return originalPromptTextFromParts(collectPromptParts());
}
function setPromptInputLocked(locked){
    promptInput.dataset.promptLocked = locked ? '1' : '0';
    promptInput.setAttribute('contenteditable', locked ? 'false' : 'true');
    promptInput.classList.toggle('prompt-input-locked', Boolean(locked));
    if(locked) closeMentionPicker();
}
function setPromptText(text){
    promptInput.textContent = text || '';
}
function clearPromptInput(options={}){
    if(options.preserveDraft){
        promptInput.dataset.preserveDraftOnce = '1';
        closeMentionPicker();
        return;
    }
    promptInput.textContent = '';
    closeMentionPicker();
    if(activeComposerSubject){
        activeComposerSubject.promptDraftHtml = '';
        activeComposerSubject.promptDraftText = '';
    }
}
function applyTheme(theme){
    const dark = theme === 'dark';
    document.documentElement.classList.toggle('theme-dark', dark);
    document.documentElement.classList.toggle('studio-theme-dark', dark);
    document.body?.classList.toggle('theme-dark', dark);
    document.body?.classList.toggle('studio-theme-dark', dark);
}
function toast(text){
    const el = document.getElementById('toast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => el.classList.remove('show'), 1800);
}
function smartReferenceRoleLabel(ref){
    const role = String(ref?.role || '');
    if(ref?.generatedEditBase || ref?.structureLock) return smartReferenceRoleWeight(ref) >= 85 ? '\u7f16\u8f91\u57fa\u51c6' : '\u6743\u91cd\u57fa\u51c6';
    if(role === 'product_truth_reference' || role === 'product_detail_reference') return '\u4ea7\u54c1\u4e8b\u5b9e';
    if(role === 'composition_reference' || role === 'primary_style_reference' || role === 'primary_reference') return '\u4e3b\u53c2\u8003';
    if(role === 'case_style_reference' || smartReferenceRoleIsCase(ref)) return '\u6848\u4f8b\u6587\u5b57';
    if(ref?.textOnlyReference || ref?.uploadReference === false) return '\u6587\u5b57\u53c2\u8003';
    if(role === 'supporting_reference') return '\u8f85\u52a9\u53c2\u8003';
    return '\u53c2\u8003';
}
function smartReferenceUploadStateLabel(ref){
    if(mediaKindForItem(ref) !== 'image') return mediaKindForItem(ref);
    return smartReferenceUploadAllowed(ref) ? '\u4e0a\u4f20' : '\u4e0d\u4e0a\u4f20';
}
function smartRunEngineLabel(sourceSettings=settings, kind='image'){
    if(sourceSettings.engine === 'modelscope') return 'Modelscope';
    if(kind === 'video') return videoProviderById(sourceSettings.videoProvider || '')?.name || sourceSettings.videoProvider || 'Video';
    return apiProviderById(sourceSettings.provider_id || '')?.name || sourceSettings.provider_id || sourceSettings.engine || 'API';
}
function smartBuildGenerationTrace({node, prompt='', refs=[], runSettings=settings, kind='image'}={}){
    const basePrompt = String(prompt || '');
    const apiImageRun = kind === 'image' && isApiLikeEngine(runSettings.engine);
    const tracePrompt = apiImageRun
        ? [outputCanvasLockPrompt(runSettings), smartRelaxPromptForReferenceSimilarity(smartRelaxPromptForCameraControl(basePrompt))].filter(Boolean).join('\n\n')
        : basePrompt;
    const creative = apiImageRun && smartCreativeVariantRequested(tracePrompt);
    const cameraControlled = apiImageRun && smartCameraControlRequested(tracePrompt);
    const referencePool = apiImageRun
        ? (creative || cameraControlled ? smartCreativeReferenceImages(refs) : imageRefsOnly(refs))
        : imageRefsOnly(refs);
    const imageRefs = imageRefsOnly(refs);
    const uploadRefs = apiImageRun
        ? referencePool.filter(smartReferenceUploadAllowed).slice(0, smartGenerationReferenceLimit(tracePrompt, referencePool))
        : imageRefs.filter(smartReferenceUploadAllowed);
    const uploadKeys = new Set(uploadRefs.map(ref => smartReferenceUrlKey(ref?.url || ref?.sourceUrl || '')));
    const allowHuman = smartGenerationAllowsHuman(node, refs, prompt);
    const productRefs = imageRefs.filter(ref => ref?.role === 'product_truth_reference' || ref?.role === 'product_detail_reference');
    const primaryRefs = imageRefs.filter(ref => ['composition_reference','primary_style_reference','primary_reference'].includes(ref?.role));
    const editBaseRefs = imageRefs.filter(ref => ref?.generatedEditBase || ref?.structureLock);
    const size = kind === 'image' && isApiLikeEngine(runSettings.engine) ? sizeForRun(runSettings) : '';
    return {
        nodeId:node?.id || '',
        nodeType:node?.type || 'smart-image',
        kind,
        engine:runSettings.engine || '',
        provider:smartRunEngineLabel(runSettings, kind),
        model:kind === 'video' ? (runSettings.videoModel || '') : (runSettings.model || runSettings.msgenModel || ''),
        size,
        quality:runSettings.quality || '',
        count:kind === 'image' ? Math.max(1, Math.min(8, Number(runSettings.count || 1))) : 1,
        promptLength:tracePrompt.length,
        promptPreview:tracePrompt.slice(0, 2200),
        referenceCount:imageRefs.length,
        uploadReferenceCount:uploadRefs.length,
        productReferenceCount:productRefs.length,
        primaryReferenceCount:primaryRefs.length,
        editBaseReferenceCount:editBaseRefs.length,
        allowHuman,
        noHumanLock:!allowHuman,
        productLock:Boolean(productRefs.length),
        posterCopy:smartPosterCopyEnabledInRequest(prompt, refs),
        references:imageRefs.map((ref, index) => ({
            index:index + 1,
            name:ref.name || `Image ${index + 1}`,
            role:ref.role || '',
            roleLabel:smartReferenceRoleLabel(ref),
            upload:uploadKeys.has(smartReferenceUrlKey(ref.url || ref.sourceUrl || '')),
            uploadLabel:uploadKeys.has(smartReferenceUrlKey(ref.url || ref.sourceUrl || '')) ? '\u4e0a\u4f20' : (smartReferenceUploadAllowed(ref) ? '\u8d85\u9650\u672a\u4f20' : '\u4e0d\u4e0a\u4f20'),
            weight:smartReferenceRoleWeight(ref),
            fidelity:ref.inputFidelity || '',
            kind:mediaKindForItem(ref),
            generatedEditBase:Boolean(ref.generatedEditBase || ref.structureLock),
            containsPerson:ref.containsPerson === true || ref.hasPerson === true || ref.personReference === true || ref.humanReference === true,
            url:ref.url || ''
        }))
    };
}
function smartTraceSummary(trace){
    if(!trace) return '';
    const locks = [
        trace.noHumanLock ? '\u65e0\u4eba\u7269\u9501' : '\u5141\u8bb8\u4eba\u7269',
        trace.productLock ? `\u4ea7\u54c1\u4e8b\u5b9e ${trace.productReferenceCount}` : '\u65e0\u4ea7\u54c1\u4e8b\u5b9e',
        trace.posterCopy ? '\u6d77\u62a5\u6587\u6848' : ''
    ].filter(Boolean).join(' / ');
    return `${trace.provider || trace.engine || 'API'} ${trace.model || ''} ${trace.size || ''} · ${trace.uploadReferenceCount}/${trace.referenceCount} \u56fe\u4e0a\u4f20 · ${locks}`.trim();
}
function smartPreflightReferenceRows(trace){
    const refs = trace?.references || [];
    if(!refs.length) return `<div class="generation-preflight-empty">\u6ca1\u6709\u56fe\u7247\u53c2\u8003</div>`;
    return refs.map(ref => `
        <div class="generation-preflight-ref ${ref.upload ? '' : 'muted'}">
            <span class="generation-preflight-ref-index">${ref.index}</span>
            <span class="generation-preflight-ref-name" title="${escapeAttr(ref.name || '')}">${escapeHtml(ref.name || `Image ${ref.index}`)}</span>
            <span class="generation-preflight-ref-role">${escapeHtml(ref.roleLabel || '')}</span>
            <span class="generation-preflight-ref-state">${escapeHtml(ref.uploadLabel || '')}</span>
            <span class="generation-preflight-ref-weight">${Number(ref.weight || 0)}%</span>
        </div>
    `).join('');
}
function smartPreflightLockHtml(trace){
    const items = [
        {label:'\u4eba\u7269', value:trace?.allowHuman ? '\u5141\u8bb8' : '\u4e0d\u5141\u8bb8', strong:!trace?.allowHuman},
        {label:'\u4ea7\u54c1', value:trace?.productLock ? `\u5df2\u9501\u5b9a ${trace.productReferenceCount}` : '\u672a\u9501\u5b9a', strong:trace?.productLock},
        {label:'\u53c2\u8003\u56fe', value:`${trace?.uploadReferenceCount || 0}/${trace?.referenceCount || 0} \u4e0a\u4f20`, strong:Boolean(trace?.uploadReferenceCount)},
        {label:'\u5c3a\u5bf8', value:trace?.size || '\u9ed8\u8ba4', strong:Boolean(trace?.size)}
    ];
    return items.map(item => `<span class="generation-preflight-chip ${item.strong ? 'strong' : ''}"><small>${escapeHtml(item.label)}</small>${escapeHtml(item.value)}</span>`).join('');
}
function ensureSmartGenerationPreflightModal(){
    let modal = document.getElementById('generationPreflightModal');
    if(modal) return modal;
    modal = document.createElement('div');
    modal.id = 'generationPreflightModal';
    modal.className = 'generation-preflight-modal';
    modal.innerHTML = `
        <div class="generation-preflight-panel" role="dialog" aria-modal="true" aria-label="\u751f\u6210\u524d\u9884\u68c0">
            <div class="generation-preflight-head">
                <div>
                    <strong>\u751f\u6210\u524d\u9884\u68c0</strong>
                    <span data-preflight-summary></span>
                </div>
                <button class="generation-preflight-close" type="button" data-preflight-cancel title="\u53d6\u6d88"><i data-lucide="x"></i></button>
            </div>
            <div class="generation-preflight-body">
                <div class="generation-preflight-chips" data-preflight-locks></div>
                <section class="generation-preflight-section">
                    <div class="generation-preflight-section-title">\u53c2\u8003\u56fe\u89d2\u8272</div>
                    <div class="generation-preflight-refs" data-preflight-refs></div>
                </section>
                <section class="generation-preflight-section">
                    <div class="generation-preflight-section-title">\u8bf7\u6c42\u63d0\u793a\u8bcd\u9884\u89c8</div>
                    <pre class="generation-preflight-prompt" data-preflight-prompt></pre>
                </section>
            </div>
            <div class="generation-preflight-actions">
                <button class="generation-preflight-btn secondary" type="button" data-preflight-cancel>\u53d6\u6d88</button>
                <button class="generation-preflight-btn primary" type="button" data-preflight-confirm>\u786e\u8ba4\u751f\u6210</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    return modal;
}
function closeSmartGenerationPreflightModal(){
    const modal = document.getElementById('generationPreflightModal');
    if(modal) modal.classList.remove('open');
    smartGenerationPreflightOpen = false;
    syncRunButtonState();
}
function confirmSmartGenerationPreflight(trace){
    const modal = ensureSmartGenerationPreflightModal();
    modal.querySelector('[data-preflight-summary]').textContent = smartTraceSummary(trace);
    modal.querySelector('[data-preflight-locks]').innerHTML = smartPreflightLockHtml(trace);
    modal.querySelector('[data-preflight-refs]').innerHTML = smartPreflightReferenceRows(trace);
    modal.querySelector('[data-preflight-prompt]').textContent = trace?.promptPreview || '\u65e0\u63d0\u793a\u8bcd';
    smartGenerationPreflightOpen = true;
    syncRunButtonState();
    refreshIcons();
    modal.classList.add('open');
    return new Promise(resolve => {
        const finish = value => {
            modal.querySelectorAll('[data-preflight-confirm],[data-preflight-cancel]').forEach(btn => btn.onclick = null);
            closeSmartGenerationPreflightModal();
            resolve(value);
        };
        modal.querySelectorAll('[data-preflight-cancel]').forEach(btn => btn.onclick = () => finish(false));
        const confirm = modal.querySelector('[data-preflight-confirm]');
        if(confirm) confirm.onclick = () => finish(true);
        modal.onclick = event => {
            if(event.target === modal) finish(false);
        };
    });
}
function selectedNode(){ return nodes.find(n => n.id === selectedId) || null; }
function clearSelection(){
    savePromptDraftForCurrent();
    selectedId = '';
    selectedIds = [];
    selectedImage = {nodeId:'', index:-1};
}
function selectedSmartNodes(){
    const ids = selectedNodeIds();
    const seen = new Set();
    return ids.map(id => nodes.find(n => n.id === id)).filter(node => {
        if(!node || seen.has(node.id)) return false;
        seen.add(node.id);
        return true;
    });
}
function selectNodeIds(ids=[]){
    const clean = [...new Set((ids || []).filter(id => nodes.some(n => n.id === id)))];
    selectedIds = clean.length > 1 ? clean : [];
    selectedId = clean.length === 1 ? clean[0] : '';
    selectedImage = {nodeId:'', index:-1};
}
function clearImageClickTimer(){
    if(imageClickTimer){
        clearTimeout(imageClickTimer);
        imageClickTimer = null;
    }
}
function syncSelectionUi(){
    world.classList.toggle('smart-multi-selected', selectedNodeIds().length > 1);
    world.querySelectorAll('.image-node').forEach(el => {
        const id = el.dataset.id || '';
        el.classList.toggle('selected', isNodeSelected(id));
        el.querySelectorAll('.thumb-item,.image-wrap').forEach(item => {
            const index = Number(item.dataset.imageIndex || 0);
            item.classList.toggle('image-selected', selectedImage.nodeId === id && selectedImage.index === index);
        });
    });
    syncRunButtonState();
}
function isNodeSelected(id){
    return selectedId === id || selectedIds.includes(id);
}
function selectedNodeIds(){
    return selectedIds.length ? selectedIds.slice() : (selectedId ? [selectedId] : []);
}
function expandedDragNodeIds(ids){
    const out = [];
    const seen = new Set();
    (ids || []).forEach(id => {
        const node = nodes.find(n => n.id === id);
        if(!node) return;
        [id, ...(isSmartGroupNode(node) ? smartGroupMembers(node).map(member => member.id) : [])].forEach(nextId => {
            if(!nextId || seen.has(nextId)) return;
            seen.add(nextId);
            out.push(nextId);
        });
    });
    return out;
}
function isEditableTarget(target){
    const el = target || document.activeElement;
    return !!el?.closest?.('input, textarea, select, option, [contenteditable="true"], .prompt-node-control, .prompt-input');
}
function isFocusedWheelEditableTarget(target){
    const active = document.activeElement;
    if(!active || active === document.body) return false;
    const editable = target?.closest?.('input, textarea, select, option, [contenteditable="true"], .prompt-input');
    return Boolean(editable && (editable === active || editable.contains?.(active)));
}
function safeScale(value){
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 1;
}
function nodeScale(node){
    const v = Number(node?.scale);
    if((node?.images || []).length > 1 && v === MEDIA_GROUP_PREVIOUS_DEFAULT_SCALE) return MEDIA_GROUP_DEFAULT_SCALE;
    return Number.isFinite(v) && v > 0 ? v : 1;
}
const MEDIA_NODE_DEFAULT_SCALE = 2;
const MEDIA_GROUP_PREVIOUS_DEFAULT_SCALE = 1.6;
const MEDIA_GROUP_DEFAULT_SCALE = 0.8;
const ZOOM_PREVIEW_NODE_DEFAULT_SCALE = 1;
const ZOOM_PREVIEW_NODE_MAX_SCALE = 1.15;
const MEDIA_GROUP_THUMB_BASE = 224;
const MEDIA_GROUP_MAX_VISIBLE_ROWS = 3;
// 智能分组卡片内的图片网格：超过这么多排就出现纵向滚动（区别于多图节点的 3 排）。
const SMART_GROUP_MAX_VISIBLE_ROWS = 4;
const EMPTY_UPLOAD_NODE_WIDTH = 316;
const EMPTY_UPLOAD_NODE_HEIGHT = 194;
const SMART_GROUP_DEFAULT_WIDTH = 340;
const SMART_GROUP_DEFAULT_HEIGHT = 286;
const SMART_GROUP_LEGACY_HEIGHT = 220;
// 分组可缩小到的最小尺寸（缩小分组时组内图片随之等比缩小，靠这个区间产生缩放系数）。
const SMART_GROUP_MIN_WIDTH = 150;
const SMART_GROUP_MIN_HEIGHT = 130;
// 组内成员（提示词/循环）的最大缩放。已移除“放大不超过原始”的限制：向外拉分组时成员随之放大。
const SMART_GROUP_MAX_MEMBER_ZOOM = 4;
function mediaNodeDefaultScale(node){
    if((node?.images || []).length > 1 && !Number.isFinite(Number(node?.scale))) return MEDIA_GROUP_DEFAULT_SCALE;
    return Number.isFinite(Number(node?.scale)) && Number(node.scale) > 0 ? Number(node.scale) : MEDIA_NODE_DEFAULT_SCALE;
}
function createImageNodeAt(point, images=[], options={}){
    const layout = imageLayout(images || [], mediaNodeDefaultScale({type:'smart-image', images:images || []}), {type:'smart-image', images:images || []});
    return createNode((point?.x || 0) - Math.round(layout.width / 2), (point?.y || 0) - Math.round(layout.height / 2), images, options);
}
function smartGroupLayoutSize(node){
    const explicitW = Number(node?.w);
    const explicitH = Number(node?.h);
    const width = Number.isFinite(explicitW) && explicitW >= SMART_GROUP_MIN_WIDTH ? explicitW : SMART_GROUP_DEFAULT_WIDTH;
    const height = !Number.isFinite(explicitH) || explicitH === SMART_GROUP_LEGACY_HEIGHT
        ? SMART_GROUP_DEFAULT_HEIGHT
        : Math.max(explicitH, SMART_GROUP_MIN_HEIGHT);
    return {
        width:Math.round(width),
        height:Math.round(height)
    };
}
function smartGroupMembers(node){
    if(!isSmartGroupNode(node)) return [];
    const ids = Array.isArray(node.items) ? node.items : [];
    const seen = new Set([node.id]);
    return ids.map(id => nodes.find(n => n.id === id)).filter(member => {
        if(!member || seen.has(member.id) || isSmartGroupNode(member)) return false;
        seen.add(member.id);
        return true;
    });
}
function smartGroupCompactMembers(node){
    return smartGroupMembers(node).filter(member => member?.type === 'smart-prompt' || member?.type === 'smart-loop');
}
function isSmartGroupCompactMember(node){
    return Boolean(node && (node.type === 'smart-prompt' || node.type === 'smart-loop') && smartGroupContainingNode(node.id));
}
// 分组当前缩放比例（1=原始）。分组就像“画布中的画布”：缩放分组时组内所有成员（含提示词）整体等比缩放+
// 重排。缩放过程用每次手势开始时的快照实时计算（见 resize 处理），不存持久基准，避免移动成员后再缩放位置回退。
// _memberZoom 仅用于：新入组的成员按它缩小，以匹配已经缩小的分组。
function smartGroupZoom(group){
    const z = Number(group?._memberZoom);
    return Number.isFinite(z) && z > 0 ? z : 1;
}
// 让新入组的成员贴合分组当前缩放（只改尺寸、保持落点不跳动）。
function scaleSmartGroupMemberToZoom(group, member, zoom){
    if(!member || !(zoom > 0) || zoom === 1) return;
    const r = nodeRect(member);
    member.w = Math.max(40, Math.round((Number(r.width) || 0) * zoom));
    member.h = Math.max(40, Math.round((Number(r.height) || 0) * zoom));
    if(isSmartImageNode(member)) member.scale = 1;
}
// 把指向 fromId 的连线/输入引用改接到 toId（吸收图片入组后保留“来源 → 分组”的连线），并去重去自环。
function rerouteSmartConnections(fromId, toId){
    if(canvas){
        canvas.connections = (canvas.connections || []).map(c => {
            let conn = c;
            if(c.from === fromId) conn = {...conn, from:toId};
            if(c.to === fromId) conn = {...conn, to:toId};
            return conn;
        }).filter((c, i, arr) => c.from !== c.to && arr.findIndex(x => x.from === c.from && x.to === c.to && (x.kind || 'flow') === (c.kind || 'flow')) === i);
    }
    nodes.forEach(n => {
        if(Array.isArray(n.inputNodeIds)) n.inputNodeIds = Array.from(new Set(n.inputNodeIds.map(id => id === fromId ? toId : id).filter(id => id !== n.id)));
    });
}
// 把一张图片节点的图片吸收进分组（收进卡片内的缩略图网格），然后删除该图片节点。
function absorbImageNodeIntoSmartGroup(group, child){
    const add = (child.images || []).map(img => stripImageGenerationMeta({...img}));
    if(!add.length) return false;
    group.images = [...(group.images || []), ...add];
    // 清掉显式尺寸，让缩略图网格按图片数自动整理排列（“放入图片自动整理”）。
    delete group.w; delete group.h;
    rerouteSmartConnections(child.id, group.id);
    nodes = nodes.filter(n => n.id !== child.id);
    nodes.forEach(g => { if(isSmartGroupNode(g) && Array.isArray(g.items)) g.items = g.items.filter(id => id !== child.id); });
    return true;
}
function addNodeToSmartGroup(group, child){
    if(!isSmartGroupNode(group) || !child || child.id === group.id) return false;
    const items = Array.isArray(group.items) ? group.items.slice() : [];
    const zoom = smartGroupZoom(group);
    if(isSmartFrameGroup(group)){
        if(isSmartGroupNode(child) || items.includes(child.id)) return false;
        nodes.forEach(g => {
            if(isSmartGroupNode(g) && g.id !== group.id && Array.isArray(g.items)) g.items = g.items.filter(id => id !== child.id);
        });
        group.items = [...items, child.id];
        return true;
    }
    if(isSmartGroupNode(child)){
        // 把一个分组拖进另一个分组：吸收它的图片到本组网格，把它的非图片成员并入本组，然后删除被拖分组本体。
        const mergedImages = (child.images || []).map(img => stripImageGenerationMeta({...img}));
        group.images = [...(group.images || []), ...mergedImages];
        if(mergedImages.length){ delete group.w; delete group.h; }
        const childMemberIds = smartGroupMembers(child)
            .map(m => m.id)
            .filter(id => id !== group.id && !items.includes(id));
        group.items = [...items, ...childMemberIds];
        childMemberIds.forEach(id => {
            const m = nodes.find(n => n.id === id);
            if(m) scaleSmartGroupMemberToZoom(group, m, zoom);
        });
        rerouteSmartConnections(child.id, group.id);
        nodes = nodes.filter(n => n.id !== child.id);
        nodes.forEach(g => { if(isSmartGroupNode(g) && Array.isArray(g.items)) g.items = g.items.filter(id => id !== child.id); });
        return true;
    }
    // 图片节点：收进卡片内的缩略图网格（不再作为画布上的独立节点）。
    if(isSmartImageNode(child)) return absorbImageNodeIntoSmartGroup(group, child);
    // 提示词 / 循环：仍作为画布上的成员节点。
    if(items.includes(child.id)) return false;
    group.items = [...items, child.id];
    scaleSmartGroupMemberToZoom(group, child, zoom);
    return true;
}
// 找到把某个节点作为成员的智能分组（用于双击组内图片时按整组左右切换）。
function smartGroupContainingNode(nodeId){
    if(!nodeId) return null;
    return nodes.find(n => isSmartGroupNode(n) && !isSmartFrameGroup(n) && Array.isArray(n.items) && n.items.includes(nodeId)) || null;
}
// 节点所属的“分组作用域”ID：成员返回其分组，分组本体返回自身，否则空。
// 用于连线合并/隐藏：同一作用域内部的连线属于分组内部关系，无需画出。
function smartGroupScopeId(nodeId){
    const group = smartGroupContainingNode(nodeId);
    if(group) return group.id;
    const node = nodes.find(n => n.id === nodeId);
    return isSmartGroupNode(node) ? node.id : '';
}
// 汇总分组内所有图片成员的图片，按阅读顺序（先行后列：成员当前 y 再 x）排成一维序列。
// 返回 [{nodeId, index, source, item}]——source 是成员节点里真实的图片对象（写回自然尺寸用），
// item 是 imageForDisplay 后的展示对象。预览左右切换、批量下载、宫格拼接都以它为数据源。
function smartGroupImageRefs(group){
    if(!isSmartGroupNode(group)) return [];
    if(isSmartFrameGroup(group)) return [];
    const refs = [];
    (group.images || []).forEach((img, index) => {
        const item = imageForDisplay(img);
        if(item?.url) refs.push({nodeId:group.id, index, source:img, item});
    });
    const members = smartGroupMembers(group)
        .filter(isSmartImageNode)
        .slice()
        .sort((a, b) => {
            const ra = nodeRect(a), rb = nodeRect(b);
            const dy = (Number(ra.y) || 0) - (Number(rb.y) || 0);
            if(Math.abs(dy) > 24) return dy;
            return (Number(ra.x) || 0) - (Number(rb.x) || 0);
        });
    members.forEach(node => {
        (node.images || []).forEach((img, index) => {
            const item = imageForDisplay(img);
            if(item?.url) refs.push({nodeId:node.id, index, source:img, item});
        });
    });
    return refs;
}
function smartGroupThumbLayout(node){
    const refs = smartGroupImageRefs(node).filter(ref => ref.item?.url);
    if(!refs.length) return null;
    const compactMembers = smartGroupCompactMembers(node);
    const count = refs.length + compactMembers.length;
    const items = refs.map(ref => ref.item);
    const explicitW = Number(node?.w);
    const explicitH = Number(node?.h);
    const hasExplicit = Number.isFinite(explicitW) && explicitW >= SMART_GROUP_MIN_WIDTH
        && Number.isFinite(explicitH) && explicitH >= SMART_GROUP_MIN_HEIGHT;
    const scale = mediaNodeDefaultScale({type:'smart-image', images:items, scale:node?.scale});
    const summarySpace = 28;
    const outerPad = 32;
    if(count === 1){
        if(hasExplicit){
            return {
                refs,
                compactMembers,
                cols:1,
                rows:1,
                visibleRows:1,
                width:Math.round(explicitW),
                height:Math.round(explicitH),
                thumb:Math.round(96 * scale),
                single:true,
                innerW:Math.max(24, Math.round(explicitW - outerPad)),
                innerH:Math.max(24, Math.round(explicitH - outerPad - summarySpace))
            };
        }
        const single = singleImageLayout(refs[0].item, {}, scale);
        return {
            refs,
            compactMembers,
            ...single,
            width:Math.max(SMART_GROUP_MIN_WIDTH, Math.round(single.width + outerPad)),
            height:Math.max(SMART_GROUP_MIN_HEIGHT, Math.round(single.height + outerPad + summarySpace)),
            innerW:single.width,
            innerH:single.height
        };
    }
    const gap = 8;
    const maxVisibleRows = compactMembers.length ? count : SMART_GROUP_MAX_VISIBLE_ROWS;
    if(hasExplicit){
        const fitted = groupImageGridLayout(count, Math.max(72, explicitW - outerPad), Math.max(56, explicitH - outerPad - summarySpace), 100000, 0, gap, maxVisibleRows);
        return {...fitted, refs, compactMembers, width:Math.round(explicitW), height:Math.round(explicitH)};
    }
    const thumb = Math.round(MEDIA_GROUP_THUMB_BASE * scale);
    const cell = thumb + gap;
    const cols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(count))));
    const rows = Math.ceil(count / cols);
    const visibleRows = Math.min(maxVisibleRows, rows);
    const gridW = cols * thumb + (cols - 1) * gap;
    const gridH = visibleRows * cell - gap;
    return {
        refs,
        compactMembers,
        cols,
        rows,
        visibleRows,
        thumb,
        width:Math.max(SMART_GROUP_MIN_WIDTH, Math.round(gridW + outerPad)),
        height:Math.max(SMART_GROUP_MIN_HEIGHT, Math.round(gridH + outerPad + summarySpace))
    };
}
const SMART_GROUP_ARRANGE_PADDING = 18;
const SMART_GROUP_ARRANGE_GAP = 16;
const SMART_GROUP_ARRANGE_HEADER = 44;
// 把分组内的成员整理成整齐的网格（先行后列保持当前阅读顺序），列数尽量接近正方形，
// 每个成员在所属单元格内居中；最后把分组框尺寸收敛到正好包住所有成员。
function arrangeSmartGroupMembers(group, options={}){
    if(!isSmartGroupNode(group)) return false;
    if(isSmartFrameGroup(group)) return arrangeSmartFrameGroupMembers(group, options);
    const hasThumbImages = smartGroupImageRefs(group).some(ref => ref.item?.url);
    if(hasThumbImages){
        const compactMembers = smartGroupCompactMembers(group);
        if(!options.skipUndo) pushUndo();
        const layout = smartGroupThumbLayout(group);
        if(!layout) return true;
        const refs = layout.refs || [];
        const thumb = Math.max(28, Math.round(Number(layout.thumb) || 96));
        const gap = 8;
        const cols = Math.max(1, Number(layout.cols) || 1);
        const gridW = cols * thumb + Math.max(0, cols - 1) * gap;
        const contentW = Math.max(0, Math.round(Number(layout.width) || SMART_GROUP_DEFAULT_WIDTH) - 32);
        const originX = (Number(group.x) || 0) + 16 + Math.max(0, Math.round((contentW - gridW) / 2));
        const originY = (Number(group.y) || 0) + 16 + 28;
        group.w = Math.max(SMART_GROUP_MIN_WIDTH, Math.round(Number(layout.width) || SMART_GROUP_DEFAULT_WIDTH));
        group.h = Math.max(SMART_GROUP_MIN_HEIGHT, Math.round(Number(layout.height) || SMART_GROUP_DEFAULT_HEIGHT));
        const ordered = compactMembers.slice().sort((a, b) => {
            const ra = nodeRect(a), rb = nodeRect(b);
            const dy = (Number(ra.y) || 0) - (Number(rb.y) || 0);
            if(Math.abs(dy) > 24) return dy;
            return (Number(ra.x) || 0) - (Number(rb.x) || 0);
        });
        ordered.forEach((member, memberIndex) => {
            const index = refs.length + memberIndex;
            const col = index % cols;
            const row = Math.floor(index / cols);
            member.x = Math.round(originX + col * (thumb + gap));
            member.y = Math.round(originY + row * (thumb + gap));
            member.w = thumb;
            member.h = thumb;
            member.scale = 1;
        });
        if(group._memberZoom !== undefined) group._memberZoom = 1;
        if(options.syncDom) syncSmartGroupMemberElements(group);
        return true;
    }
    const members = smartGroupMembers(group);
    if(!members.length) return false;
    if(!options.skipUndo) pushUndo();
    const ordered = members.slice().sort((a, b) => {
        const ra = nodeRect(a), rb = nodeRect(b);
        const dy = (Number(ra.y) || 0) - (Number(rb.y) || 0);
        if(Math.abs(dy) > 24) return dy;
        return (Number(ra.x) || 0) - (Number(rb.x) || 0);
    });
    // 归一化图片成员尺寸：清掉入组缩放写入的 w/h，回到自然尺寸。否则反复拖出/拖入会越缩越小，
    // 且“整理”无法恢复——这是用户反馈的“拖出再拖入图片变小、整理也救不回来”的根因。
    ordered.forEach(node => {
        if(isSmartImageNode(node)){
            delete node.w;
            delete node.h;
        }
    });
    const sizes = ordered.map(node => {
        const r = nodeRect(node);
        return {node, w:Math.max(40, Number(r.width) || 120), h:Math.max(40, Number(r.height) || 120)};
    });
    const count = sizes.length;
    const pad = SMART_GROUP_ARRANGE_PADDING;
    const gap = SMART_GROUP_ARRANGE_GAP;
    const headerH = SMART_GROUP_ARRANGE_HEADER;
    const cols = Math.max(1, Math.min(count, Math.round(Math.sqrt(count)) || 1));
    const rows = Math.ceil(count / cols);
    const colW = new Array(cols).fill(0);
    const rowH = new Array(rows).fill(0);
    sizes.forEach((s, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        colW[c] = Math.max(colW[c], s.w);
        rowH[r] = Math.max(rowH[r], s.h);
    });
    const colX = [];
    let accX = 0;
    for(let c = 0; c < cols; c++){ colX[c] = accX; accX += colW[c] + gap; }
    const rowY = [];
    let accY = 0;
    for(let r = 0; r < rows; r++){ rowY[r] = accY; accY += rowH[r] + gap; }
    const originX = (Number(group.x) || 0) + pad;
    const originY = (Number(group.y) || 0) + headerH + pad;
    sizes.forEach((s, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        s.node.x = Math.round(originX + colX[c] + (colW[c] - s.w) / 2);
        s.node.y = Math.round(originY + rowY[r] + (rowH[r] - s.h) / 2);
    });
    const totalW = colW.reduce((a, b) => a + b, 0) + gap * (cols - 1) + pad * 2;
    const totalH = rowH.reduce((a, b) => a + b, 0) + gap * (rows - 1) + pad * 2 + headerH;
    group.w = Math.max(SMART_GROUP_MIN_WIDTH, Math.round(totalW));
    group.h = Math.max(SMART_GROUP_MIN_HEIGHT, Math.round(totalH));
    // 成员已回到自然尺寸，分组缩放基准随之归零，避免后续再缩放时跳变。
    if(group._memberZoom !== undefined) group._memberZoom = 1;
    return true;
}
function smartArrangeNodeIsOutput(node){
    if(!node || !isSmartImageNode(node)) return false;
    if(node.autoBranchOutputSourceId || node.sourceNodeId || node.runAt || node.runModelPrompt || node.runPrompt) return true;
    if((node.images || []).some(img => img?.generatedResult)) return true;
    return upstreamNodesForKinds(node, ['input', 'flow']).some(source => source?.type === 'smart-prompt' || source?.type === 'smart-loop');
}
function smartArrangeNodeRole(node){
    if(!node) return 'process';
    if(node.type === 'smart-prompt' || node.type === 'smart-loop') return 'process';
    if(smartArrangeNodeIsOutput(node)) return 'output';
    if(isSmartImageNode(node) || isSmartGroupNode(node)) return 'reference';
    return 'process';
}
function smartArrangeReadOrder(a, b){
    const ar = nodeRect(a), br = nodeRect(b);
    const dy = (Number(ar.y) || 0) - (Number(br.y) || 0);
    if(Math.abs(dy) > 32) return dy;
    return (Number(ar.x) || 0) - (Number(br.x) || 0);
}
function smartArrangeGrid(nodesToArrange, originX, originY, options={}){
    const list = (nodesToArrange || []).slice().sort(smartArrangeReadOrder);
    if(!list.length) return {width:0, height:0};
    const gapX = Number(options.gapX) || 52;
    const gapY = Number(options.gapY) || 54;
    const cols = Math.max(1, Math.min(list.length, Number(options.cols) || 1));
    const sizes = list.map(node => {
        const rect = nodeRect(node);
        return {node, width:Math.max(40, Number(rect.width) || 120), height:Math.max(40, Number(rect.height) || 120)};
    });
    const rows = Math.ceil(sizes.length / cols);
    const colW = new Array(cols).fill(0);
    const rowH = new Array(rows).fill(0);
    sizes.forEach((item, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        colW[col] = Math.max(colW[col], item.width);
        rowH[row] = Math.max(rowH[row], item.height);
    });
    const colX = [];
    let x = originX;
    for(let col = 0; col < cols; col++){
        colX[col] = x;
        x += colW[col] + gapX;
    }
    const rowY = [];
    let y = originY;
    for(let row = 0; row < rows; row++){
        rowY[row] = y;
        y += rowH[row] + gapY;
    }
    sizes.forEach((item, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        item.node.x = Math.round(colX[col] + (colW[col] - item.width) / 2);
        item.node.y = Math.round(rowY[row] + (rowH[row] - item.height) / 2);
    });
    const width = colW.reduce((sum, value) => sum + value, 0) + gapX * Math.max(0, cols - 1);
    const height = rowH.reduce((sum, value) => sum + value, 0) + gapY * Math.max(0, rows - 1);
    return {width, height};
}
function smartArrangeOutputColumnCount(count){
    if(count <= 3) return 1;
    if(count <= 8) return 2;
    return 3;
}
function fitSmartFrameGroupToMembers(group, members=smartGroupMembers(group)){
    const rects = (members || []).map(nodeRect);
    if(!rects.length) return false;
    const minX = Math.min(...rects.map(r => r.x));
    const minY = Math.min(...rects.map(r => r.y));
    const maxX = Math.max(...rects.map(r => r.x + r.width));
    const maxY = Math.max(...rects.map(r => r.y + r.height));
    const padX = 32;
    const padTop = 64;
    const padBottom = 28;
    group.x = Math.round(minX - padX);
    group.y = Math.round(minY - padTop);
    group.w = Math.max(360, Math.round(maxX - minX + padX * 2));
    group.h = Math.max(240, Math.round(maxY - minY + padTop + padBottom));
    return true;
}
function arrangeSmartFrameGroupMembers(group, options={}){
    if(!isSmartFrameGroup(group)) return false;
    const members = smartGroupMembers(group).slice().sort(smartArrangeReadOrder);
    if(!members.length) return false;
    if(!options.skipUndo) pushUndo();
    const originX = (Number(group.x) || 0) + 32;
    const originY = (Number(group.y) || 0) + 64;
    const buckets = {reference:[], process:[], output:[]};
    members.forEach(node => {
        buckets[smartArrangeNodeRole(node)].push(node);
    });
    const columns = [
        {nodes:buckets.reference, cols:1},
        {nodes:buckets.process, cols:1},
        {nodes:buckets.output, cols:smartArrangeOutputColumnCount(buckets.output.length)}
    ].filter(column => column.nodes.length);
    const columnGap = 92;
    let x = originX;
    columns.forEach((column, index) => {
        const result = smartArrangeGrid(column.nodes, x, originY, {cols:column.cols, gapX:58, gapY:64});
        x += result.width + (index < columns.length - 1 ? columnGap : 0);
    });
    fitSmartFrameGroupToMembers(group, members);
    return true;
}
function arrangeSelectedNodes(){
    const selected = selectedSmartNodes();
    if(!selected.length){ toast('请先选择要排列的节点'); return false; }
    if(selected.length === 1 && isSmartGroupNode(selected[0])){
        if(arrangeSmartGroupMembers(selected[0])){
            render();
            scheduleSave();
            toast('已整理分组');
            return true;
        }
        toast('这个分组里没有可整理的成员');
        return false;
    }
    pushUndo();
    const ordered = selected.slice().sort(smartArrangeReadOrder);
    const rects = ordered.map(nodeRect);
    const minX = Math.min(...rects.map(r => r.x));
    const minY = Math.min(...rects.map(r => r.y));
    const buckets = {reference:[], process:[], output:[]};
    ordered.forEach(node => {
        buckets[smartArrangeNodeRole(node)].push(node);
    });
    const columns = [
        {nodes:buckets.reference, cols:1},
        {nodes:buckets.process, cols:1},
        {nodes:buckets.output, cols:smartArrangeOutputColumnCount(buckets.output.length)}
    ].filter(column => column.nodes.length);
    const columnGap = 92;
    let x = minX;
    columns.forEach((column, index) => {
        const result = smartArrangeGrid(column.nodes, x, minY, {
            cols:column.cols,
            gapX:58,
            gapY:64
        });
        x += result.width + (index < columns.length - 1 ? columnGap : 0);
    });
    selectNodeIds(ordered.map(node => node.id));
    render();
    scheduleSave();
    toast('已自动排列');
    return true;
}
function mediaLayoutSize(img){
    const width = Number(img?.natural_w || img?.width || img?.w || img?.layout_w || img?.preview_w || 0);
    const height = Number(img?.natural_h || img?.height || img?.h || img?.layout_h || img?.preview_h || 0);
    return width > 0 && height > 0 ? {width, height} : {width:0, height:0};
}
function copyMediaSizeFields(source, target={}){
    if(!source || typeof source !== 'object') return target;
    ['natural_w','natural_h','width','height','w','h','layout_w','layout_h'].forEach(key => {
        const n = Number(source[key]);
        if(Number.isFinite(n) && n > 0) target[key] = n;
    });
    return target;
}
function singleImageLayout(image, node, scale){
    const explicitW = Number(node?.w);
    const explicitH = Number(node?.h);
    if(Number.isFinite(explicitW) && explicitW > 24 && Number.isFinite(explicitH) && explicitH > 24){
        return {cols:1, rows:1, width:Math.round(explicitW), height:Math.round(explicitH), thumb:Math.round(96 * scale), single:true};
    }
    // 音频没有自然宽高，否则会套用图片的 260x180 默认框，导致卡片四周大片空白。给一个贴合内容的紧凑尺寸。
    if(isAudioMediaItem(image)){
        return {cols:1, rows:1, width:Math.round(288 * scale), height:Math.round(150 * scale), thumb:Math.round(96 * scale), single:true};
    }
    const layoutSize = mediaLayoutSize(image);
    const naturalW = layoutSize.width;
    const naturalH = layoutSize.height;
    if(naturalW > 0 && naturalH > 0){
        const maxW = 260 * scale;
        const maxH = 220 * scale;
        const fit = Math.min(maxW / naturalW, maxH / naturalH);
        return {
            cols:1,
            rows:1,
            width:Math.max(72, Math.round(naturalW * fit)),
            height:Math.max(72, Math.round(naturalH * fit)),
            thumb:Math.round(96 * scale),
            single:true
        };
    }
    return {cols:1, rows:1, width:Math.round(260*scale), height:Math.round(180*scale), thumb:Math.round(96*scale), single:true};
}
function groupImageGridLayout(count, explicitW, explicitH, maxThumb, pad=32, gap=8, maxVisibleRows=MEDIA_GROUP_MAX_VISIBLE_ROWS){
    let best = null;
    for(let cols = 1; cols <= count; cols++){
        const rows = Math.ceil(count / cols);
        const visibleRows = Math.min(Math.max(1, maxVisibleRows), rows);
        const availableW = explicitW - pad - (cols - 1) * gap;
        const availableH = explicitH - pad - (visibleRows - 1) * gap;
        if(availableW <= 0 || availableH <= 0) continue;
        const rawThumb = Math.floor(Math.min(availableW / cols, availableH / visibleRows));
        const fittedThumb = Math.max(28, Math.min(maxThumb, rawThumb));
        const fits = rawThumb >= 28;
        const usedW = cols * fittedThumb + (cols - 1) * gap + pad;
        const usedH = visibleRows * fittedThumb + (visibleRows - 1) * gap + pad;
        const spareW = Math.max(0, explicitW - usedW);
        const spareH = Math.max(0, explicitH - usedH);
        const atMax = fittedThumb >= maxThumb;
        const score = [
            fits ? 1 : 0,
            fittedThumb,
            atMax ? cols : 0,
            -(spareW + spareH * 0.35),
            -rows
        ];
        let better = !best;
        if(best){
            for(let i = 0; i < score.length; i++){
                if(score[i] === best.score[i]) continue;
                better = score[i] > best.score[i];
                break;
            }
        }
        if(better){
            best = {cols, rows, visibleRows, thumb:fittedThumb, score};
        }
    }
    const fallbackCols = Math.min(count, 2);
    const fallbackRows = Math.ceil(count / fallbackCols);
    return best || {cols:fallbackCols, rows:fallbackRows, visibleRows:Math.min(MEDIA_GROUP_MAX_VISIBLE_ROWS, fallbackRows), thumb:28};
}
function smartNodeInputThumbRows(count){
    return count ? Math.ceil(Math.min(10, count) / 5) : 0;
}
function smartNodeInputThumbsHeight(images){
    const rows = smartNodeInputThumbRows((images || []).length);
    return rows ? rows * 44 + (rows - 1) * 6 + 8 : 0;
}
function promptNodeInputImages(node){
    return promptNodeInputMediaForLLM(node).filter(img => img?.url);
}
function promptNodeInputMediaForLLM(node){
    const refs = smartImageUsesWorkflowInput(node) ? workflowInputImagesFor(node) : inputImagesFor(node);
    return (refs || []).filter(ref => ref?.url);
}
function smartNodeInputThumbsHtml(images, opts={}){
    const refs = (images || []).filter(img => img?.url);
    if(!refs.length) return '';
    const limit = Math.min(10, refs.length);
    const items = refs.slice(0, limit).map((img, index) => {
        const label = opts.labelPrefix ? `${opts.labelPrefix}${index + 1}` : (window.StudioI18n?.lang?.() === 'en' ? `Image ${index + 1}` : `图${index + 1}`);
        const roleLabel = smartReferenceRoleLabel(img);
        const uploadLabel = smartReferenceUploadStateLabel(img);
        const media = isAudioMediaItem(img)
            ? `<div class="media-thumb audio-thumb"><i data-lucide="file-audio"></i><span>${escapeHtml(img.name || 'Audio')}</span></div>`
            : isVideoMediaItem(img)
            ? smartVideoPreviewHtml(img, 256, 'alt=""')
            : smartPreviewImgHtml(img, 256, 'alt=""');
        return `<div class="smart-node-input-thumb" title="${escapeHtml(`${label} · ${roleLabel} · ${uploadLabel}`)}">${media}<span class="smart-node-input-badge">${escapeHtml(label)}</span><span class="smart-node-role-badge">${escapeHtml(roleLabel)}</span></div>`;
    }).join('');
    const more = refs.length > limit ? `<div class="smart-node-input-thumb smart-node-input-more">+${refs.length - limit}</div>` : '';
    return `<div class="smart-node-input-thumbs">${items}${more}</div>`;
}
const PROMPT_LLM_INSTRUCTION_DEFAULT_H = 58;
const PROMPT_LLM_INSTRUCTION_MIN_H = 40;
const PROMPT_LLM_INSTRUCTION_MAX_H = 400;
const PROMPT_SPLIT_PREVIEW_DEFAULT_H = 70;
const PROMPT_SPLIT_PREVIEW_MIN_H = 40;
const PROMPT_SPLIT_PREVIEW_MAX_H = 220;
const PROMPT_SPLIT_RESIZE_BAR_H = 9;
function promptLlmInstructionHeight(node){
    const h = Number(node?.llmInstructionHeight);
    if(!Number.isFinite(h)) return PROMPT_LLM_INSTRUCTION_DEFAULT_H;
    return Math.max(PROMPT_LLM_INSTRUCTION_MIN_H, Math.min(PROMPT_LLM_INSTRUCTION_MAX_H, Math.round(h)));
}
function promptNodeSeparator(node){
    const raw = String(node?.promptSeparator ?? ';');
    return raw === '' ? ';' : raw;
}
function promptNodeReferenceWeight(node){
    const raw = Number(node?.styleMatch?.referenceWeight ?? node?.referenceWeight ?? 65);
    if(!Number.isFinite(raw)) return 65;
    return Math.max(0, Math.min(100, Math.round(raw)));
}
function generatedEditBaseReferenceWeight(node){
    const raw = Number(node?.generatedEditBaseReferenceWeight ?? node?.referenceWeight ?? node?.styleMatch?.referenceWeight ?? 100);
    if(!Number.isFinite(raw)) return 100;
    return Math.max(0, Math.min(100, Math.round(raw)));
}
function generatedEditBaseSimilarityIntent(weight){
    if(weight >= 85) return 'strict_edit_base_structure';
    if(weight >= 60) return 'balanced_edit_base_structure';
    return 'loose_edit_base_reference';
}
const PROMPT_CAMERA_FOCAL_MIN = 14;
const PROMPT_CAMERA_FOCAL_MAX = 135;
const PROMPT_CAMERA_DEFAULT_FOCAL = 50;
const PROMPT_CAMERA_SENSOR_WIDTH_MM = 36;
const PROMPT_CAMERA_PANEL_EXTRA_H = 202;
const PROMPT_CAMERA_AZIMUTH_OPTIONS = [
    {value:'front', label:'正面', prompt:'front view, camera facing the subject straight on'},
    {value:'front-left', label:'左前 3/4', prompt:'three-quarter front view from camera left, visible depth and side plane'},
    {value:'left', label:'左侧面', prompt:'left profile side view, camera perpendicular to the subject'},
    {value:'back-left', label:'左后 3/4', prompt:'three-quarter rear view from camera left, showing the back plane with some side depth'},
    {value:'back', label:'背面', prompt:'rear view, camera behind the subject'},
    {value:'back-right', label:'右后 3/4', prompt:'three-quarter rear view from camera right, showing the back plane with some side depth'},
    {value:'right', label:'右侧面', prompt:'right profile side view, camera perpendicular to the subject'},
    {value:'front-right', label:'右前 3/4', prompt:'three-quarter front view from camera right, visible depth and side plane'}
];
const PROMPT_CAMERA_ELEVATION_OPTIONS = [
    {value:'eye', label:'平视', prompt:'eye-level camera height with neutral vertical perspective'},
    {value:'slight-low', label:'微低角度', prompt:'slightly low camera angle, subtly looking up without distortion'},
    {value:'low', label:'低角度', prompt:'low-angle shot, camera below the subject looking upward'},
    {value:'slight-high', label:'微俯视', prompt:'slightly high camera angle, gently looking down'},
    {value:'high', label:'高角度', prompt:'high-angle shot, camera above the subject looking down'},
    {value:'top-down', label:'俯拍', prompt:'top-down overhead view with a clear plan-view composition'}
];
const PROMPT_CAMERA_AZIMUTH_GEOMETRY = {
    front:{x:0, y:1},
    'front-left':{x:-0.72, y:0.72},
    left:{x:-1, y:0},
    'back-left':{x:-0.72, y:-0.72},
    back:{x:0, y:-1},
    'back-right':{x:0.72, y:-0.72},
    right:{x:1, y:0},
    'front-right':{x:0.72, y:0.72}
};
const PROMPT_CAMERA_ELEVATION_GEOMETRY = {
    'top-down':{y:-1},
    high:{y:-0.72},
    'slight-high':{y:-0.36},
    eye:{y:0},
    'slight-low':{y:0.38},
    low:{y:0.78}
};
function promptCameraOptionByValue(options, value, fallbackIndex=0){
    return options.find(item => item.value === value) || options[fallbackIndex] || options[0];
}
function promptCameraClampUnit(value){
    const n = Number(value);
    if(!Number.isFinite(n)) return 0;
    return Math.max(-1, Math.min(1, n));
}
function promptCameraAzimuthGeometry(value){
    return PROMPT_CAMERA_AZIMUTH_GEOMETRY[value] || PROMPT_CAMERA_AZIMUTH_GEOMETRY.front;
}
function promptCameraElevationGeometry(value){
    return PROMPT_CAMERA_ELEVATION_GEOMETRY[value] || PROMPT_CAMERA_ELEVATION_GEOMETRY.eye;
}
function promptCameraNearestAzimuth(x, y){
    const px = promptCameraClampUnit(x);
    const py = promptCameraClampUnit(y);
    let best = PROMPT_CAMERA_AZIMUTH_OPTIONS[0];
    let bestDist = Infinity;
    PROMPT_CAMERA_AZIMUTH_OPTIONS.forEach(option => {
        const p = promptCameraAzimuthGeometry(option.value);
        const dist = Math.hypot(px - p.x, py - p.y);
        if(dist < bestDist){
            bestDist = dist;
            best = option;
        }
    });
    return best;
}
function promptCameraNearestElevation(y){
    const py = promptCameraClampUnit(y);
    let best = PROMPT_CAMERA_ELEVATION_OPTIONS[0];
    let bestDist = Infinity;
    PROMPT_CAMERA_ELEVATION_OPTIONS.forEach(option => {
        const p = promptCameraElevationGeometry(option.value);
        const dist = Math.abs(py - p.y);
        if(dist < bestDist){
            bestDist = dist;
            best = option;
        }
    });
    return best;
}
function promptNodeCameraEnabled(node){
    return node?.cameraEnabled === true;
}
function promptNodeCameraFocalLength(node){
    const raw = Number(node?.cameraFocalLength ?? PROMPT_CAMERA_DEFAULT_FOCAL);
    if(!Number.isFinite(raw)) return PROMPT_CAMERA_DEFAULT_FOCAL;
    return Math.max(PROMPT_CAMERA_FOCAL_MIN, Math.min(PROMPT_CAMERA_FOCAL_MAX, Math.round(raw)));
}
function promptNodeCameraAzimuth(node){
    return promptCameraOptionByValue(PROMPT_CAMERA_AZIMUTH_OPTIONS, node?.cameraAzimuth || 'front');
}
function promptNodeCameraElevation(node){
    return promptCameraOptionByValue(PROMPT_CAMERA_ELEVATION_OPTIONS, node?.cameraElevation || 'eye');
}
function promptNodeCameraFov(focalLength){
    return Math.round((2 * Math.atan(PROMPT_CAMERA_SENSOR_WIDTH_MM / (2 * focalLength)) * 180 / Math.PI) * 10) / 10;
}
function promptNodeCameraLensInfo(focalLength){
    const fov = promptNodeCameraFov(focalLength);
    if(focalLength <= 18) return {label:'超广角', en:'ultra-wide-angle', fov, note:'空间更开阔，近大远小更明显', prompt:'expanded wide perspective, strong foreground/background separation, visible environment, dynamic near-to-far depth'};
    if(focalLength <= 28) return {label:'广角', en:'wide-angle', fov, note:'环境感更强，适合大场景和近景产品', prompt:'wide-angle perspective with clear environmental context, mild perspective expansion, energetic spatial depth'};
    if(focalLength <= 40) return {label:'人文广角', en:'moderate wide-angle', fov, note:'自然带环境，画面不容易挤', prompt:'natural documentary wide perspective, balanced subject and environment, realistic spatial depth'};
    if(focalLength <= 60) return {label:'标准镜头', en:'standard', fov, note:'接近人眼，透视最自然', prompt:'natural standard-lens perspective, realistic proportions, minimal perspective distortion'};
    if(focalLength <= 95) return {label:'短长焦', en:'short telephoto', fov, note:'主体更突出，背景轻微压缩', prompt:'short-telephoto perspective, mild background compression, flattering subject proportions, clean separation'};
    return {label:'长焦', en:'telephoto', fov, note:'压缩空间，主体更强势', prompt:'telephoto perspective, compressed background layers, strong subject isolation, reduced wide-angle distortion'};
}
function promptNodeCameraLensEvidence(focalLength){
    if(focalLength <= 18) return 'ultra-wide lens evidence: nearby hands, drink, fruit, tabletop, or foreground props become visibly larger than background elements; edges stretch slightly; deep environment is visible; do not render a flat portrait crop';
    if(focalLength <= 28) return 'wide-angle lens evidence: clear near-to-far scale difference, energetic depth, visible environment around the subject, foreground elements read closer to the viewer';
    if(focalLength <= 40) return 'moderate-wide lens evidence: natural environmental portrait framing, readable subject plus surrounding scene, mild depth cues without flattening';
    if(focalLength <= 60) return 'standard-lens evidence: natural proportions, minimal distortion, believable eye-distance framing';
    if(focalLength <= 95) return 'short-telephoto lens evidence: flattering compressed depth, cleaner background separation, less foreground exaggeration';
    return 'telephoto lens evidence: compressed background layers, isolated subject, narrow field of view, no wide-angle near-far exaggeration';
}
function promptNodeCameraAzimuthEvidence(value){
    const map = {
        front:'front evidence: both sides of the face/product are balanced and symmetrical, camera axis points straight toward the subject',
        'front-left':'front-left three-quarter evidence: the subject/product right side recedes away from camera, the left-facing plane is more visible, depth is clear',
        left:'left profile evidence: side silhouette dominates, front plane is mostly hidden, camera is perpendicular to the subject',
        'back-left':'back-left three-quarter evidence: back plane is visible with a left-side edge, face/front label is mostly turned away unless the pose naturally twists',
        back:'back evidence: camera is behind the subject/product, back plane dominates, front-facing details are not the main view',
        'back-right':'back-right three-quarter evidence: back plane is visible with a right-side edge, face/front label is mostly turned away unless the pose naturally twists',
        right:'right profile evidence: side silhouette dominates, front plane is mostly hidden, camera is perpendicular to the subject',
        'front-right':'front-right three-quarter evidence: the subject/product left side recedes away from camera, the right-facing plane is more visible, depth is clear'
    };
    return map[value] || map.front;
}
function promptNodeCameraElevationEvidence(value){
    const map = {
        eye:'eye-level evidence: horizon and face/product center sit near camera height, no looking up or down distortion',
        'slight-low':'slightly-low evidence: camera is just below face/product center, subtle upward view, chin/table underside only lightly visible',
        low:'low-angle evidence: camera is below the subject/product looking upward, underside planes and vertical convergence are visible, foreground objects feel closer and more dominant',
        'slight-high':'slightly-high evidence: camera is slightly above the subject/product, top surfaces become visible, gaze and table plane angle downward gently',
        high:'high-angle evidence: camera is above the subject/product looking down, head/top surfaces/table plane are clearly visible, background floor/table geometry opens up',
        'top-down':'top-down evidence: overhead plan-view composition, top surfaces dominate, vertical faces compress, camera is clearly above the scene instead of eye-level'
    };
    return map[value] || map.eye;
}
function promptNodeCameraViewInstruction(azimuth, elevation){
    if(elevation.value === 'top-down'){
        return `View angle: overhead top-down view with a ${azimuth.label} rotational bias; keep the camera clearly above the scene and use the horizontal direction only as a rotation/orientation cue.`;
    }
    if(elevation.value === 'high' || elevation.value === 'slight-high'){
        return `View angle: ${elevation.prompt}; combine it with ${azimuth.prompt} so the shot reads as a high-view recomposition, not an eye-level copy.`;
    }
    if(elevation.value === 'low' || elevation.value === 'slight-low'){
        return `View angle: ${elevation.prompt}; combine it with ${azimuth.prompt} so the shot reads as an upward-looking recomposition, not an eye-level copy.`;
    }
    return `View angle: ${azimuth.prompt}; ${elevation.prompt}.`;
}
function promptNodeCameraEvidenceList(node, lens, azimuth, elevation){
    const focal = promptNodeCameraFocalLength(node);
    return [
        promptNodeCameraLensEvidence(focal),
        promptNodeCameraAzimuthEvidence(azimuth.value),
        promptNodeCameraElevationEvidence(elevation.value),
        'composition evidence: rebuild foreground, midground, background, crop, subject scale, and negative space around this camera choice',
        'avoid evidence failures: not the same reference viewpoint, not a normal straight-on eye-level portrait, not the same crop, not the same pose/layout skeleton when those conflict with camera control'
    ].join('; ');
}
function promptNodeCameraSummary(node){
    const focal = promptNodeCameraFocalLength(node);
    const lens = promptNodeCameraLensInfo(focal);
    return `${focal}mm · ${lens.label} · ${promptNodeCameraAzimuth(node).label} · ${promptNodeCameraElevation(node).label}`;
}
function promptNodeCameraPrompt(node){
    if(!promptNodeCameraEnabled(node)) return '';
    const focal = promptNodeCameraFocalLength(node);
    const lens = promptNodeCameraLensInfo(focal);
    const azimuth = promptNodeCameraAzimuth(node);
    const elevation = promptNodeCameraElevation(node);
    const evidence = promptNodeCameraEvidenceList(node, lens, azimuth, elevation);
    const posterCopyRole = node?.posterCopyEnabled
        ? ' If Poster copy is enabled, use the primary reference as a lightweight poster-text guide: preserve the main visible headline/price/CTA text when practical, but simplify tiny copy and avoid forcing exact line-by-line reconstruction.'
        : ' If Poster copy is disabled, remove poster/ad overlay text from the reference, but preserve poster brand identity marks/logos/brand names and product-surface brand marks, logos, and printed package labels.';
    const allowHuman = smartGenerationAllowsHuman(node, defaultReferenceImagesFor(node), smartNodeUserIntentText(node));
    const visualOverride = smartLatestRequestChangesBackgroundPalette(node);
    const referenceRole = visualOverride
        ? (allowHuman
            ? 'Use the reference image only for exact product truth, broad person styling category, non-conflicting materials, beauty-lighting quality, commercial finish, and exact readable poster copy when Poster copy is enabled. The latest user request, not the reference image, controls the background and color palette.'
            : 'Use the reference image only for exact product truth, non-conflicting materials, lighting quality, commercial finish, and exact readable poster copy when Poster copy is enabled; do not transfer human content, and let the latest user request control the background and color palette.')
        : (allowHuman
            ? 'Use the reference image only for exact product truth, broad person styling category, materials, palette, lighting mood, commercial finish, and exact readable poster copy when Poster copy is enabled.'
            : 'Use the reference image only for exact product truth, materials, palette, lighting mood, commercial finish, and exact readable poster copy when Poster copy is enabled; do not transfer any person, face, hand, skin, body, pose, or human silhouette.');
    return [
        allowHuman
            ? `HIGHEST PRIORITY CAMERA OVERRIDE: obey this camera instruction for lens, focal length, viewpoint, perspective, crop, foreground/midground/background, object placement, subject scale, and pose geometry. This overrides any reference-image camera angle, crop, composition lock, subject scale hierarchy, foreground/background relationship, pose geometry, or layout instruction. ${referenceRole}${posterCopyRole}`
            : `HIGHEST PRIORITY CAMERA OVERRIDE: obey this camera instruction for lens, focal length, viewpoint, perspective, crop, foreground/midground/background, object placement, product scale, object geometry, and support-surface relationship. This overrides any reference-image camera angle, crop, composition lock, scale hierarchy, foreground/background relationship, pose, human/body content, or layout instruction. ${referenceRole}${posterCopyRole}`,
        allowHuman
            ? 'Reference role assignment: reference image = exact product/style/material/lighting/exact-readable-copy plus broad person styling category only; camera control = composition, crop, lens, viewpoint, subject scale, and spatial layout.'
            : 'Reference role assignment: reference image = exact product/style/material/lighting/exact-readable-copy only; camera control = composition, crop, lens, viewpoint, subject scale, and spatial layout. Human/body content is not allowed unless explicitly requested.',
        `Use a ${focal}mm ${lens.en} lens on a full-frame camera, about ${lens.fov} degree horizontal field of view: ${lens.prompt}.`,
        promptNodeCameraViewInstruction(azimuth, elevation),
        `Mandatory visual evidence: ${evidence}.`,
        'Render a visibly changed camera position with real optical perspective, parallax, subject scale, and framing. If the reference image was eye-level or straight-on, deliberately depart from it when the camera control asks for low, high, top-down, side, or wide-angle. Do not place focal-length labels, camera UI, or technical text inside the image.'
    ].join(' ');
}
function promptNodeCameraExtraHeight(node){
    return promptNodeCameraEnabled(node) ? PROMPT_CAMERA_PANEL_EXTRA_H : 0;
}
function ensurePromptNodeCameraDefaults(node){
    if(!node) return;
    node.cameraFocalLength = promptNodeCameraFocalLength(node);
    node.cameraAzimuth = promptNodeCameraAzimuth(node).value;
    node.cameraElevation = promptNodeCameraElevation(node).value;
}
function promptNodeReferenceWeightPrompt(node){
    if(!node?.styleMatch) return '';
    const weight = promptNodeReferenceWeight(node);
    const allowHuman = smartGenerationAllowsHuman(node, defaultReferenceImagesFor(node), smartNodeUserIntentText(node));
    const visualOverride = smartLatestRequestChangesBackgroundPalette(node);
    const fidelityRule = visualOverride
        ? (allowHuman
            ? 'Preserve non-conflicting lighting quality, materials, skin treatment, product surface finish, realistic edges, and contact shadows, but do not preserve the old reference background tone or palette; the latest requested colors are mandatory.'
            : 'Preserve non-conflicting lighting quality, materials, product surface finish, realistic edges, and contact shadows, but do not preserve the old reference background tone or palette; the latest requested colors are mandatory.')
        : (allowHuman
            ? 'Preserve visible lighting, materials, background tone, skin treatment, product surface finish, realistic edges, and contact shadows; avoid plastic skin, generic studio drift, or CG-looking packaging.'
            : 'Preserve visible lighting, materials, background tone, product surface finish, realistic edges, and contact shadows; avoid generic studio drift, CG-looking packaging, or adding any human/body content.');
    const productRule = 'Attached product-detail images are strict SKU identity references: preserve category, silhouette, proportions, structural parts, material, colors, product-surface brand marks, logos, printed label text/graphics, label-block placement, finish, and scale; never substitute a generic same-category product.';
    const caseRule = 'Case-library references are secondary and may influence polish only, never product identity, pose, background, or layout.';
    const antiCloneRule = allowHuman
        ? 'Do not recreate the reference as a near-identical copy: change the exact pose, hand placement, crop, framing, micro-expression, and small spatial layout details. The weight controls style/composition affinity, not pixel-level duplication.'
        : 'Do not recreate the reference as a near-identical copy: change the exact crop, framing, product position, prop arrangement, surface contact, shadow shape, and small spatial layout details. The weight controls style/composition affinity, not pixel-level duplication.';
    const personRule = allowHuman
        ? smartPersonSimilarityInstruction(weight)
        : 'Human/body content disabled: do not generate people, faces, hands, fingers, arms, skin, bodies, silhouettes, mannequins, or human poses unless the user explicitly asks for them.';
    if(promptNodeCameraEnabled(node)){
        const retainedStyle = visualOverride
            ? 'Keep only exact product identity, non-conflicting lighting/material quality, and commercial finish. Do not inherit the old reference background or palette.'
            : 'Keep only exact product identity, palette, lighting/material quality, and commercial finish.';
        return `Original reference similarity: ${weight}/100. Camera control overrides the reference viewpoint, crop, lens, composition, scale hierarchy, pose, and layout. ${retainedStyle} ${personRule} ${antiCloneRule} ${fidelityRule} ${productRule} ${caseRule}`;
    }
    if(weight >= 85){
        return allowHuman
            ? `Original reference similarity: ${weight}/100. Strongly preserve the commercial visual language, palette, lighting quality, broad camera family, and product-to-subject scale, but still create a visibly new shot. Do not copy the exact crop, pose geometry, hand placement, face angle, background silhouette, or object placement. Keep the attached product-detail images as the exact SKU anchor. ${personRule} ${antiCloneRule} ${fidelityRule} ${productRule} ${caseRule}`
            : `Original reference similarity: ${weight}/100. Strongly preserve the commercial visual language, palette, lighting quality, broad camera family, and product/environment scale, but still create a visibly new product-only shot. Do not copy any human, hand, face, body, pose, or silhouette content. Keep the attached product-detail images as the exact SKU anchor. ${personRule} ${antiCloneRule} ${fidelityRule} ${productRule} ${caseRule}`;
    }
    if(weight >= 60){
        return allowHuman
            ? `Original reference similarity: ${weight}/100. Balanced reference use: keep product identity, palette, lighting mood, and general campaign composition family while allowing a clearly different crop, pose, gesture, camera distance, and layout rhythm. ${personRule} ${antiCloneRule} ${fidelityRule} ${productRule} ${caseRule}`
            : `Original reference similarity: ${weight}/100. Balanced reference use: keep product identity, palette, lighting mood, and general campaign composition family while allowing a clearly different crop, product placement, prop/support structure, camera distance, and layout rhythm. ${personRule} ${antiCloneRule} ${fidelityRule} ${productRule} ${caseRule}`;
    }
    if(weight >= 35){
        return allowHuman
            ? `Original reference similarity: ${weight}/100. Loose reference use: keep product identity, palette direction, and advertising polish, but use new framing, pose, crop, camera angle, and background details. ${personRule}`
            : `Original reference similarity: ${weight}/100. Loose reference use: keep product identity, palette direction, and advertising polish, but use new product-only framing, crop, camera angle, support props, and background details. ${personRule}`;
    }
    return allowHuman
        ? `Original reference similarity: ${weight}/100. Use the image only as light product/color inspiration; allow a substantially different camera, pose, composition, and scene. ${personRule}`
        : `Original reference similarity: ${weight}/100. Use the image only as light product/color inspiration; allow a substantially different product-only camera, composition, and scene. ${personRule}`;
}
function promptNodePosterCopyPrompt(node){
    if(!node || node.type !== 'smart-prompt') return '';
    if(node.posterCopyEnabled){
        return 'Poster copy enabled: use the uploaded primary poster/reference image as a lightweight text guide. Preserve the main readable headline, key price/offer, CTA, and important badge text when practical, with similar placement and hierarchy. Tiny dense text may become clean non-readable marks or simplified label blocks. Product-detail references control SKU appearance only; they must not remove, suppress, replace, translate, or invent the main poster text.';
    }
    return 'Poster copy disabled: keep the primary reference as the visual poster-layout reference, but remove or avoid readable poster/ad overlay text copied from it, such as large headlines, slogans, price tags, CTA buttons, promotional badges, banners, UI text, external watermarks, and decorative typography outside product surfaces. Preserve poster brand identity elements such as top-corner brand logos, brand names, product-line marks, and store/festival brand tags; do not classify these as removable poster copy. Preserve the reference composition family, subject/product placement, crop, camera family, color palette, lighting, graphic panels, border/strip/badge positions, bottom sale-bar geometry, and commercial hierarchy according to the reference-weight setting. Replace removed poster copy with clean blank space, non-readable short marks, or simple graphic blocks so the poster structure remains close without readable ad copy. Preserve product-surface text as product identity: brand marks, logos, bottle/box/tube labels, SKU names, volume marks, and printed packaging graphics should remain on the product. Do not erase product labels or replace them with random new claims.';
}
function promptNodeAdditionalGuidancePrompt(node){
    const instruction = String(node?.llmInstruction || '').trim();
    if(!instruction) return '';
    return [
        'Active additional generation guidance from the prompt node:',
        instruction,
        'This is a high-priority constraint. Follow named references such as 图2/图3/图4 or Image 2/3/4 literally.'
    ].join('\n');
}
function promptNodePromptItems(node){
    const text = String(node?.text || '').trim();
    const guidanceText = String(node?.llmInstruction || '').trim();
    if(!text && !guidanceText) return [];
    const withPromptControls = items => {
        const additionalGuidancePrompt = promptNodeAdditionalGuidancePrompt(node);
        const latestVisualOverridePrompt = promptNodeLatestVisualOverridePrompt(node);
        const weightPrompt = promptNodeReferenceWeightPrompt(node);
        const posterCopyPrompt = promptNodePosterCopyPrompt(node);
        const cameraPrompt = promptNodeCameraPrompt(node);
        if(cameraPrompt){
            const trailingControls = [additionalGuidancePrompt, latestVisualOverridePrompt, weightPrompt, posterCopyPrompt].filter(Boolean).join('\n');
            return items.map(item => smartRelaxPromptForCameraControl(`${cameraPrompt}\n\n${item}\n\n${trailingControls}`));
        }
        const controls = [additionalGuidancePrompt, latestVisualOverridePrompt, weightPrompt, posterCopyPrompt].filter(Boolean).join('\n');
        return controls ? items.map(item => [item, controls].filter(Boolean).join('\n\n')) : items;
    };
    if(!text) return withPromptControls(['']);
    if(node?.promptSplitEnabled !== true) return withPromptControls([text]);
    const sep = promptNodeSeparator(node);
    if(!sep) return withPromptControls([text]);
    const items = text.split(sep).map(item => item.trim()).filter(Boolean);
    return withPromptControls(items.length > 1 ? items : [text]);
}
function promptNodeSplitExtraHeight(node){
    if(node?.promptSplitEnabled !== true) return 0;
    return 25 + promptNodeSplitPreviewHeight(node) + PROMPT_SPLIT_RESIZE_BAR_H;
}
function promptNodeSplitPreviewHeight(node){
    const h = Number(node?.promptSplitPreviewHeight);
    if(!Number.isFinite(h)) return PROMPT_SPLIT_PREVIEW_DEFAULT_H;
    return Math.max(PROMPT_SPLIT_PREVIEW_MIN_H, Math.min(PROMPT_SPLIT_PREVIEW_MAX_H, Math.round(h)));
}
function syncPromptNodeHeightForSplit(node, prevExtra=0){
    if(!node) return;
    const nextExtra = promptNodeSplitExtraHeight(node);
    const explicitH = Number(node.h);
    const currentH = Number.isFinite(explicitH) ? explicitH : 0;
    const fallbackH = promptNodeMinHeight(node);
    node.h = Math.max(fallbackH, currentH ? currentH - Math.max(0, prevExtra) + nextExtra : fallbackH);
    node.w = Math.max(Number(node.w) || 0, 316);
}
function promptNodeMinHeight(node){
    return node?.llmEnabled ? promptNodeExpandedHeight(node) : 240 + promptNodeSplitExtraHeight(node) + promptNodeCameraExtraHeight(node);
}
function promptTextItemsForNode(node, ctx=smartLoopContext){
    if(!node) return [];
    if(node.type === 'smart-prompt') return promptNodePromptItems(node);
    if(node.type === 'smart-loop'){
        const text = smartLoopPrompt(node, ctx);
        return text ? [text] : [];
    }
    if(node.type === 'smart-group') return smartGroupMembers(node).flatMap(member => promptTextItemsForNode(member, ctx));
    return [];
}
function promptNodeUpstreamPromptItems(node, ctx=smartLoopContext){
    const seen = new Set();
    return inputNodesFor(node).flatMap(input => promptTextItemsForNode(input, ctx)).map(text => String(text || '').trim()).filter(text => {
        if(!text || seen.has(text)) return false;
        seen.add(text);
        return true;
    });
}
function promptNodeUpstreamPromptText(node, ctx=smartLoopContext){
    return promptNodeUpstreamPromptItems(node, ctx).join('\n\n');
}
function promptNodeLLMShouldReplace(node){
    const instruction = String(node?.llmInstruction || '').trim();
    return /压缩|缩短|精简|简化|太长|过长|超出.{0,4}(?:字数|长度|限制)|字数限制|改写|重写|整合|去重|compress|shorten|condense|concise|too long|length limit|rewrite|deduplicate/i.test(instruction);
}
function promptNodeLLMInputText(node, ctx=smartLoopContext){
    const upstream = promptNodeUpstreamPromptText(node, ctx).trim();
    const instruction = String(node?.llmInstruction || '').trim();
    const promptContextNode = instruction ? {...node, llmInstruction:''} : node;
    const currentPrompt = promptNodePromptItems(promptContextNode).join('\n\n').trim();
    if(instruction && currentPrompt){
        if(promptNodeLLMShouldReplace(node)){
            return [
                'Existing prompt to rewrite:',
                currentPrompt,
                upstream ? `\nUpstream prompt context:\n${upstream}` : '',
                '\nUser rewrite request:',
                instruction,
                `Return one complete replacement prompt only, no explanation. Remove repetition and boilerplate while preserving product identity, named reference assignments, composition, camera, exact user constraints, and negative requirements. Keep it within ${SMART_MATCHED_PROMPT_BUDGET} characters.`
            ].filter(Boolean).join('\n');
        }
        return [
            'Existing prompt context. Do not discard, overwrite, or repeat it:',
            currentPrompt,
            upstream ? `\nUpstream prompt context:\n${upstream}` : '',
            '\nUser modification request. Return only the additional or corrected instruction that should be appended to the existing prompt:',
            instruction
        ].filter(Boolean).join('\n');
    }
    return [upstream, instruction || currentPrompt].filter(Boolean).join('\n\n');
}
function appendLLMOutputToPromptText(originalText, llmText){
    const original = String(originalText || '').trim();
    const addition = String(llmText || '').trim();
    if(!addition) return original;
    if(!original) return addition;
    if(original.includes(addition)) return original;
    const cleaned = addition.replace(original, '').trim() || addition;
    if(!cleaned || original.includes(cleaned)) return original;
    return `${original}\n\nLLM additional guidance:\n${cleaned}`;
}
function promptNodeStyleRematchRequest(node, ctx=smartLoopContext){
    const instruction = String(node?.llmInstruction || '').trim();
    if(instruction) return instruction;
    const upstream = promptNodeUpstreamPromptText(node, ctx).trim();
    return upstream || '';
}
function promptNodeStyleRematchImage(node){
    const currentRefs = imageRefsOnly(promptNodeCurrentReferenceImages(node));
    const primary = currentRefs.find(ref => ['composition_reference','primary_style_reference','primary_reference'].includes(ref?.role)) || currentRefs[0];
    const currentRef = primary?.url || '';
    if(currentRef) return String(currentRef).trim();
    return String(node?.styleMatch?.image || '').trim();
}
function promptNodeCurrentReferenceRoleBrief(node){
    const refs = imageRefsOnly(promptNodeCurrentReferenceImages(node));
    if(!refs.length) return '';
    const lines = refs.slice(0, SMART_REFERENCE_IMAGE_MAX).map((ref, index) => {
        const label = `Image ${index + 1}`;
        if(['composition_reference','primary_style_reference','primary_reference'].includes(ref?.role)){
            return `${label}: primary scene/style reference. Preserve its visible scene relationship, lighting mood, material/skin/product finish, product-surface labels/brand marks, background tone, and commercial visual structure according to the reference-weight setting.`;
        }
        if(ref?.role === 'product_truth_reference' || ref?.role === 'product_detail_reference'){
            return `${label}: strict product truth reference. Preserve exact SKU identity, silhouette, proportions, component layout, material, color, finish, product-surface brand marks/logos/printed label text, and real product geometry.`;
        }
        return `${label}: supporting current reference image.`;
    });
    return [
        'Current attached references stay unchanged after this rematch:',
        ...lines,
        'Do not let newly matched library cases replace these current references.'
    ].join('\n');
}
function promptNodeExpandedHeight(node){
    // 指令文本框（发送给 LLM 的内容）可拖动加高，超出默认高度的部分要叠加进节点高度。
    const extra = Math.max(0, promptLlmInstructionHeight(node) - PROMPT_LLM_INSTRUCTION_DEFAULT_H);
    const upstreamExtra = node?.llmEnabled && promptNodeUpstreamPromptItems(node).length ? 74 : 0;
    return (node?.llmSystemEnabled ? 420 : 360) + smartNodeInputThumbsHeight(promptNodeInputImages(node)) + extra + upstreamExtra + promptNodeSplitExtraHeight(node) + promptNodeCameraExtraHeight(node);
}
function promptNodeLayoutSize(node){
    const oldCollapsedH = 230;
    const oldExpandedH = node?.llmSystemEnabled ? 400 : 340;
    const explicitW = Number(node?.w);
    const explicitH = Number(node?.h);
    if(isSmartGroupCompactMember(node) && Number.isFinite(explicitW) && explicitW > 24 && Number.isFinite(explicitH) && explicitH > 24){
        return {width:Math.round(explicitW), height:Math.round(explicitH)};
    }
    const width = !Number.isFinite(explicitW) || explicitW === 360 ? 316 : explicitW;
    const fallbackH = promptNodeMinHeight(node);
    const legacyExpandedH = node?.llmSystemEnabled ? 344 : 292;
    const height = !Number.isFinite(explicitH) || explicitH === 194 || explicitH === oldCollapsedH || explicitH === oldExpandedH || explicitH === legacyExpandedH
        ? fallbackH
        : Math.max(explicitH, fallbackH);
    return {width:Math.round(width), height:Math.round(height)};
}
// 智能分组的图片网格布局：跟多图节点一致，但可见排数上限为 4（超过出现滚动），且缩略图无放大上限
//（用户拉大分组时图片随之变大，不再封顶在原始尺寸）。
function smartGroupImageGridLayout(node){
    const images = (node?.images || []).filter(img => img?.url);
    const count = images.length;
    const s = mediaNodeDefaultScale(node);
    if(count === 1){
        const single = singleImageLayout(images[0], node, s);
        const explicitW = Number(node?.w), explicitH = Number(node?.h);
        const hasExplicit = Number.isFinite(explicitW) && explicitW > 24 && Number.isFinite(explicitH) && explicitH > 24;
        // 容器有 16px 内边距（PAD=32）；无显式尺寸时把外框放大 PAD，以包住图片，避免“分组比图片还小”。
        return hasExplicit ? single : {...single, width:single.width + 32, height:single.height + 32};
    }
    const baseThumb = Math.round(MEDIA_GROUP_THUMB_BASE * s);
    const cell = baseThumb + 8;
    const PAD = 32;
    const explicitW = Number(node?.w);
    const explicitH = Number(node?.h);
    const cols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(count))));
    const rows = Math.ceil(count / cols);
    const visibleRows = Math.min(SMART_GROUP_MAX_VISIBLE_ROWS, rows);
    if(Number.isFinite(explicitW) && explicitW > 40 && Number.isFinite(explicitH) && explicitH > 40){
        // 用户拉伸过分组：按显式尺寸拟合，maxThumb 给一个极大值以解除“放大不超过原始”的限制。
        const fitted = groupImageGridLayout(count, explicitW, explicitH, 100000, PAD, 8, SMART_GROUP_MAX_VISIBLE_ROWS);
        return {cols:fitted.cols, rows:fitted.rows, visibleRows:fitted.visibleRows, width:Math.round(explicitW), height:fitted.visibleRows * (fitted.thumb + 8) - 8 + PAD, thumb:fitted.thumb};
    }
    const width = Math.max(Math.round(226 * s), cols * cell + PAD);
    const height = visibleRows * cell - 8 + PAD;
    return {cols, rows, visibleRows, width, height, thumb:baseThumb};
}
function imageLayout(images, scale=1, node=null){
    if(node?.type === 'smart-group'){
        const groupThumbLayout = smartGroupThumbLayout(node);
        if(groupThumbLayout) return groupThumbLayout;
        return {cols:1, rows:1, ...smartGroupLayoutSize(node), thumb:96, single:true};
    }
    if(node?.type === 'smart-prompt') return {cols:1, rows:1, ...promptNodeLayoutSize(node), thumb:96, single:true};
    if(node?.type === 'smart-loop'){
        const explicitW = Number(node.w);
        const explicitH = Number(node.h);
        if(isSmartGroupCompactMember(node) && Number.isFinite(explicitW) && explicitW > 24 && Number.isFinite(explicitH) && explicitH > 24){
            return {cols:1, rows:1, width:Math.round(explicitW), height:Math.round(explicitH), thumb:96, single:true};
        }
        return {cols:1, rows:1, width:Math.round(Number(node.w) || smartLoopWidth(node)), height:Math.round(Math.max(Number(node.h) || 0, smartLoopHeight(node))), thumb:96, single:true};
    }
    const count = (images || []).length;
    const s = node?.type === 'smart-image' || !node?.type ? mediaNodeDefaultScale(node) : (Number.isFinite(scale) && scale > 0 ? scale : 1);
    if(count === 0){
        const explicitW = Number(node?.w);
        const explicitH = Number(node?.h);
        const pending = Number(node?.pending) > 0 || Boolean(node?.queued);
        const fallbackW = pending ? 260 * s : EMPTY_UPLOAD_NODE_WIDTH;
        const fallbackH = pending ? 180 * s : EMPTY_UPLOAD_NODE_HEIGHT;
        return {
            cols:1,
            rows:1,
            width:Math.round(Number.isFinite(explicitW) && explicitW > 24 ? explicitW : fallbackW),
            height:Math.round(Number.isFinite(explicitH) && explicitH > 24 ? explicitH : fallbackH),
            thumb:Math.round(96*s),
            single:true
        };
    }
    if(count === 1) return singleImageLayout(images[0], node, s);
    const thumb = Math.round(MEDIA_GROUP_THUMB_BASE * s);
    const cell = thumb + 8;
    const PAD = 32; // group-node has 16px padding on each side
    const grid = images.find(img => img?.grid?.type === 'grid-split')?.grid;
    const explicitW = Number(node?.w);
    const explicitH = Number(node?.h);
    if(grid){
        const cols = Math.max(1, Number(grid.cols || 1));
        const rows = Math.max(1, Number(grid.rows || 1));
        const visibleRows = Math.min(MEDIA_GROUP_MAX_VISIBLE_ROWS, rows);
        if(Number.isFinite(explicitW) && explicitW > 40 && Number.isFinite(explicitH) && explicitH > 40){
            const fittedThumb = Math.max(28, Math.floor(Math.min((explicitW - PAD - (cols - 1) * 8) / cols, (explicitH - PAD - (visibleRows - 1) * 8) / visibleRows)));
            return {cols, rows, visibleRows, width:Math.round(explicitW), height:visibleRows * (fittedThumb + 8) - 8 + PAD, thumb:fittedThumb};
        }
        return {cols, rows, visibleRows, width:Math.max(Math.round(226*s), cols * cell + PAD), height:visibleRows * cell - 8 + PAD, thumb};
    }
    const cols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(count))));
    const rows = Math.ceil(count / cols);
    const visibleRows = Math.min(MEDIA_GROUP_MAX_VISIBLE_ROWS, rows);
    if(Number.isFinite(explicitW) && explicitW > 40 && Number.isFinite(explicitH) && explicitH > 40){
        const fitted = groupImageGridLayout(count, explicitW, explicitH, thumb, PAD, 8);
        return {cols:fitted.cols, rows:fitted.rows, visibleRows:fitted.visibleRows, width:Math.round(explicitW), height:fitted.visibleRows * (fitted.thumb + 8) - 8 + PAD, thumb:fitted.thumb};
    }
    const width = Math.max(Math.round(226*s), cols * cell + PAD);
    const height = visibleRows * cell - 8 + PAD;
    return {cols, rows, visibleRows, width, height, thumb};
}
function smartLoopCount(node){
    return Math.max(1, Math.min(100, Number(node?.count || 1) || 1));
}
function smartLoopWidth(node){
    return 340;
}
function smartLoopHeight(node){
    let h = 168;
    if(node?.imageInput) h += 72;
    if(node?.showPrompt) {
        const promptCount = Math.max(1, smartLoopPromptFieldValues(node).length);
        h += 94 + promptCount * 58 + smartLoopUpstreamPromptPreviewHeight(node);
    }
    h += smartNodeInputThumbsHeight(smartLoopPreviewImages(node));
    return h;
}
function fitSmartLoopNode(node){
    if(!node || node.type !== 'smart-loop') return;
    node.w = smartLoopWidth(node);
    node.h = smartLoopHeight(node);
}
function nodeRect(node){
    const layout = imageLayout(node.images || [], nodeScale(node), node);
    return {x:node.x || 0, y:node.y || 0, width:layout.width, height:layout.height};
}
function applyViewport(){
    world.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`;
    // world 被 transform:scale 缩放后，其内部带 backdrop-filter 的卡片（参数设置/合成卡等）
    // 会被部分浏览器（Chrome/Edge 等 Blink 内核）当作独立合成层先按 1x 栅格化、再整体缩放，
    // 缩小时位图被降采样 → 组件发虚。缩放态下关闭这些 backdrop-filter（底色本身已接近不透明，
    // 观感几乎无差），让卡片随矢量重新栅格化，保持清晰。
    world.classList.toggle('canvas-scaled', Math.abs(viewport.scale - 1) > 0.001);
    shell.style.backgroundSize = '24px 24px';
    shell.style.backgroundPosition = '0 0';
    renderMinimap();
}
function screenToWorld(event){
    const rect = shell.getBoundingClientRect();
    return {
        x:(event.clientX - rect.left - viewport.x) / viewport.scale,
        y:(event.clientY - rect.top - viewport.y) / viewport.scale
    };
}
function viewportCenter(){
    return {
        x:(shell.clientWidth / 2 - viewport.x) / viewport.scale,
        y:(shell.clientHeight / 2 - viewport.y) / viewport.scale
    };
}
function renderMinimap(){
    if(!minimapContent || !minimapViewport) return;
    const width = minimapContent.clientWidth || 170;
    const height = minimapContent.clientHeight || 108;
    const viewW = shell.clientWidth / viewport.scale;
    const viewH = shell.clientHeight / viewport.scale;
    const viewX = -viewport.x / viewport.scale;
    const viewY = -viewport.y / viewport.scale;
    const rects = nodes.filter(n => n.id !== SMART_LOG_PREVIEW_NODE_ID).map(nodeRect);
    rects.push({x:viewX, y:viewY, width:viewW, height:viewH});
    const minX = Math.min(...rects.map(r => r.x), -200);
    const minY = Math.min(...rects.map(r => r.y), -200);
    const maxX = Math.max(...rects.map(r => r.x + r.width), viewX + viewW + 200);
    const maxY = Math.max(...rects.map(r => r.y + r.height), viewY + viewH + 200);
    const scale = Math.min(width / Math.max(1, maxX - minX), height / Math.max(1, maxY - minY));
    const offsetX = (width - (maxX - minX) * scale) / 2;
    const offsetY = (height - (maxY - minY) * scale) / 2;
    smartMinimapState = {minX, minY, scale, offsetX, offsetY, width, height};
    const project = r => ({
        left:offsetX + (r.x - minX) * scale,
        top:offsetY + (r.y - minY) * scale,
        width:Math.max(4, r.width * scale),
        height:Math.max(4, r.height * scale)
    });
    const nodeHtml = rects.slice(0, -1).map(r => {
        const p = project(r);
        return `<div class="minimap-node" style="left:${p.left}px;top:${p.top}px;width:${p.width}px;height:${p.height}px"></div>`;
    }).join('');
    const view = project({x:viewX, y:viewY, width:viewW, height:viewH});
    minimapContent.innerHTML = `${nodeHtml}<div id="minimapViewport" class="smart-minimap-viewport" style="left:${view.left}px;top:${view.top}px;width:${view.width}px;height:${view.height}px"></div>`;
    minimapViewport = document.getElementById('minimapViewport');
}
function minimapEventToWorld(event){
    if(!smartMinimapState) renderMinimap();
    const state = smartMinimapState;
    if(!state) return viewportCenter();
    const rect = minimapContent.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;
    return {
        x:state.minX + (mx - state.offsetX) / Math.max(0.0001, state.scale),
        y:state.minY + (my - state.offsetY) / Math.max(0.0001, state.scale)
    };
}
function centerViewportOnWorldPoint(point){
    viewport.x = shell.clientWidth / 2 - point.x * viewport.scale;
    viewport.y = shell.clientHeight / 2 - point.y * viewport.scale;
    applyViewport();
    scheduleSave();
}
function fitAllNodesViewport(){
    if(!nodes.length){
        viewport.scale = 0.45;
        viewport.x = shell.clientWidth / 2;
        viewport.y = shell.clientHeight / 2;
        applyViewport();
        scheduleSave();
        return;
    }
    const rects = nodes.map(nodeRect);
    const minX = Math.min(...rects.map(r => r.x));
    const minY = Math.min(...rects.map(r => r.y));
    const maxX = Math.max(...rects.map(r => r.x + r.width));
    const maxY = Math.max(...rects.map(r => r.y + r.height));
    const pad = 160;
    const width = Math.max(1, maxX - minX + pad * 2);
    const height = Math.max(1, maxY - minY + pad * 2);
    const nextScale = Math.max(0.06, Math.min(0.82, (shell.clientWidth - 80) / width, (shell.clientHeight - 80) / height));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    viewport.scale = nextScale;
    viewport.x = shell.clientWidth / 2 - cx * viewport.scale;
    viewport.y = shell.clientHeight / 2 - cy * viewport.scale;
    applyViewport();
    scheduleSave();
}
function enterZoomPreview(){
    if(zoomPreviewState) return;
    zoomPreviewState = {...viewport};
    shell.classList.add('zoom-preview');
    closeCreateMenu();
    fitAllNodesViewport();
}
function exitZoomPreview(point=null){
    if(!zoomPreviewState) return false;
    const prev = zoomPreviewState;
    zoomPreviewState = null;
    shell.classList.remove('zoom-preview');
    viewport.scale = prev.scale;
    if(point){
        viewport.x = shell.clientWidth / 2 - point.x * viewport.scale;
        viewport.y = shell.clientHeight / 2 - point.y * viewport.scale;
    } else {
        viewport.x = prev.x;
        viewport.y = prev.y;
    }
    applyViewport();
    scheduleSave();
    return true;
}
function exitZoomPreviewToNode(nodeId){
    if(!zoomPreviewState) return false;
    const node = nodes.find(n => n.id === nodeId);
    if(!node) return exitZoomPreview();
    const prev = zoomPreviewState;
    const rect = nodeRect(node);
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    const fitW = Math.max(1, shell.clientWidth - 160);
    const fitH = Math.max(1, shell.clientHeight - 160);
    const fitScale = Math.min(
        ZOOM_PREVIEW_NODE_MAX_SCALE,
        fitW / Math.max(1, rect.width),
        fitH / Math.max(1, rect.height)
    );
    const readableScale = Math.min(ZOOM_PREVIEW_NODE_MAX_SCALE, Math.max(ZOOM_PREVIEW_NODE_DEFAULT_SCALE, fitScale));
    zoomPreviewState = null;
    shell.classList.remove('zoom-preview');
    viewport.scale = Math.max(safeScale(prev.scale), readableScale);
    viewport.x = shell.clientWidth / 2 - cx * viewport.scale;
    viewport.y = shell.clientHeight / 2 - cy * viewport.scale;
    applyViewport();
    scheduleSave();
    return true;
}
function toggleZoomPreview(){
    if(zoomPreviewState) exitZoomPreview();
    else enterZoomPreview();
}
function imageProviders(){
    return (apiProviders || []).filter(p => p.enabled !== false && p.id !== 'modelscope' && p.id !== 'volcengine' && (p.image_models || []).length);
}
function volcengineProvider(){
    return (apiProviders || []).find(p => p.id === 'volcengine' && p.enabled !== false) || {
        id:'volcengine',
        name:'火山引擎',
        image_models:[],
        video_models:DEFAULT_VIDEO_MODELS,
        enabled:true
    };
}
function smartRunNeedsPrompt(sourceSettings=settings){
    return true;
}
function chatApiProviders(){
    return (apiProviders || []).filter(p => p.enabled !== false && (p.chat_models || []).length);
}
function resolveChatProviderId(providerId=''){
    const providers = chatApiProviders();
    if(providers.some(p => p.id === providerId)) return providerId;
    return providers[0]?.id || 'comfly';
}
function providerChatModels(providerId){
    const provider = chatApiProviders().find(p => p.id === providerId);
    return [...new Set(provider?.chat_models || [])];
}
function resolveChatModel(model='', providerId=''){
    const models = providerChatModels(resolveChatProviderId(providerId));
    return models.includes(model) ? model : (models[0] || model || 'gpt-4o-mini');
}
function preferredPromptRematchModel(providerId=''){
    const models = providerChatModels(resolveChatProviderId(providerId));
    return models.find(model => /^gpt-5\.5$/i.test(model))
        || models.find(model => /gpt-5\.5/i.test(model))
        || resolveChatModel('', providerId);
}
function chatProviderOptions(selectedId=''){
    const selected = resolveChatProviderId(selectedId);
    return chatApiProviders().map(provider => `<option value="${escapeHtml(provider.id)}" ${provider.id === selected ? 'selected' : ''}>${escapeHtml(provider.name || provider.id)}</option>`).join('');
}
function chatModelOptions(selectedModel='', providerId=''){
    const selectedProvider = resolveChatProviderId(providerId);
    const models = providerChatModels(selectedProvider);
    const selected = resolveChatModel(selectedModel, selectedProvider);
    return [...new Set([selected, ...models].filter(Boolean))].map(model => `<option value="${escapeHtml(model)}" ${model === selected ? 'selected' : ''}>${escapeHtml(model)}</option>`).join('');
}
function apiProviderById(providerId){
    if(providerId === 'volcengine') return volcengineProvider();
    return (apiProviders || []).find(p => p.id === providerId) || imageProviders()[0] || null;
}
// 认证素材 asset:// 是平台绑定的：返回某 provider 所属的认证平台键（与后端一致）
function videoProviderPlatform(providerId){
    const p = (apiProviders || []).find(x => x.id === providerId);
    const proto = String(p?.protocol || '').toLowerCase();
    const base = String(p?.base_url || '').toLowerCase();
    if(proto === 'apimart' || base.includes('apimart.ai')) return 'apimart';
    if(proto === 'volcengine' || providerId === 'volcengine') return 'volcengine';
    return '';
}
function providerImageModels(providerId){
    if(providerId === 'volcengine') return volcengineProvider().image_models || [];
    return (apiProviders || []).find(p => p.id === providerId)?.image_models || [];
}
// 即梦图生图（挂了参考图）不支持 3.0/3.1，此时从模型下拉里隐藏它们。
const JIMENG_IMAGE2IMAGE_UNSUPPORTED = ['3.0', '3.1'];
function jimengImageEditMode(){
    if(settings.provider_id !== 'jimeng') return false;
    const node = activeComposerNode() || selectedNode();
    const refs = node ? visibleReferenceImagesFor(node) : [];
    return refs.length > 0;
}
function filterJimengImageModels(models){
    if(settings.provider_id !== 'jimeng' || !jimengImageEditMode()) return models;
    return (models || []).filter(m => !JIMENG_IMAGE2IMAGE_UNSUPPORTED.includes(String(m)));
}
let _jimengLastEditMode = null;
let _jimengModelRefreshing = false;
// 参考图增删导致即梦文生图/图生图切换时，重新渲染参数面板以更新模型下拉。
function syncJimengModelPillForRefs(){
    if(_jimengModelRefreshing) return;
    if(settings.provider_id !== 'jimeng' || settings.engine !== 'api' || settings.apiKind === 'video'){
        _jimengLastEditMode = null;
        return;
    }
    const mode = jimengImageEditMode();
    if(mode === _jimengLastEditMode) return;
    _jimengLastEditMode = mode;
    _jimengModelRefreshing = true;
    try { renderDynamicParams(); } finally { _jimengModelRefreshing = false; }
}
// 即梦各视频指令支持的模型集合不同，按当前参考素材推断指令并过滤模型下拉。
const JIMENG_SEEDANCE_VIDEO_MODELS = ['seedance2.0_vip', 'seedance2.0fast_vip', 'seedance2.0', 'seedance2.0fast'];
const JIMENG_VIDEO_MODELS_BY_COMMAND = {
    text2video: JIMENG_SEEDANCE_VIDEO_MODELS,
    multimodal2video: JIMENG_SEEDANCE_VIDEO_MODELS,
    image2video: ['3.0', '3.0fast', '3.0pro', '3.5pro', ...JIMENG_SEEDANCE_VIDEO_MODELS],
    frames2video: ['3.0', '3.5pro', ...JIMENG_SEEDANCE_VIDEO_MODELS],
};
function jimengVideoCommand(){
    const node = activeComposerNode() || selectedNode();
    const refs = node ? visibleReferenceImagesFor(node) : [];
    const imageRefs = imageRefsOnly(refs);
    const hasVideoRef = videoRefsOnly(refs).length > 0 || Boolean(manualSmartVideoLink(settings));
    if(settings.videoMultimodal || hasVideoRef) return 'multimodal2video';
    if(imageRefs.length >= 2) return settings.videoUseFrameRoles ? 'frames2video' : 'multiframe2video';
    if(imageRefs.length >= 1) return 'image2video';
    return 'text2video';
}
function filterJimengVideoModels(models){
    if(settings.videoProvider !== 'jimeng') return models;
    const allowed = JIMENG_VIDEO_MODELS_BY_COMMAND[jimengVideoCommand()];
    if(!allowed) return models; // multiframe2video 等：官方规格未知，不过滤
    return (models || []).filter(m => allowed.includes(String(m)));
}
let _jimengLastVideoCommand = null;
function syncJimengVideoModelPillForRefs(){
    if(_jimengModelRefreshing) return;
    if(settings.videoProvider !== 'jimeng' || settings.engine !== 'api' || settings.apiKind !== 'video'){
        _jimengLastVideoCommand = null;
        return;
    }
    const command = jimengVideoCommand();
    if(command === _jimengLastVideoCommand) return;
    _jimengLastVideoCommand = command;
    _jimengModelRefreshing = true;
    try { renderDynamicParams(); } finally { _jimengModelRefreshing = false; }
}
function sanitizeSmartApiSelection(target=settings){
    if(!target || typeof target !== 'object') return target;
    if(target.engine === 'volcengine'){
        if(target.apiKind === 'video'){
            target.videoProvider = 'volcengine';
            const models = volcengineVideoModels();
            if(!models.includes(target.videoModel)) target.videoModel = models[0] || '';
        } else {
            target.provider_id = 'volcengine';
            const models = providerImageModels('volcengine');
            if(!models.includes(target.model)) target.model = models[0] || '';
        }
        return target;
    }
    clearVolcengineSelectionOutsideVolcengine(target);
    if(target.provider_id){
        const models = providerImageModels(target.provider_id);
        if(models.length && !models.includes(target.model)) target.model = models[0] || '';
    }
    if((target.engine || 'api') === 'api' && (target.apiKind || 'image') !== 'video'){
        const allowAuto = isGptImageAutoSizeModel(target.model);
        if(!target.resolution) target.resolution = allowAuto ? 'auto' : '1k';
        if(!allowAuto && target.resolution === 'auto') target.resolution = '1k';
    }
    if(target.videoProvider){
        const models = providerVideoModels(target.videoProvider);
        if(models.length && !models.includes(target.videoModel)) target.videoModel = models[0] || '';
    }
    return target;
}
function modelscopeProvider(){
    return (apiProviders || []).find(p => p.id === 'modelscope' && p.enabled !== false) || null;
}
function modelscopeImageModels(){
    return modelscopeProvider()?.image_models || ['Tongyi-MAI/Z-Image-Turbo'];
}
const DEFAULT_VIDEO_MODELS = ['veo3-fast','veo3','sora','runway','kling','pika','minimax-video','wan-v2','seedance-1.0-pro','jimeng-vide-3.0','jimeng-video-3.0-pro'];
function videoApiProviders(){
    const fromConfig = (apiProviders || []).filter(p => p.enabled !== false && p.id !== 'volcengine' && (p.video_models || []).length);
    if(fromConfig.length) return fromConfig;
    return [{id:'comfly', name:'Comfly', video_models:DEFAULT_VIDEO_MODELS, enabled:true}];
}
function videoProviderById(providerId){
    if(providerId === 'volcengine') return volcengineProvider();
    return videoApiProviders().find(p => p.id === providerId) || videoApiProviders()[0] || null;
}
function providerVideoModels(providerId){
    if(providerId === 'volcengine') return volcengineVideoModels();
    const provider = videoApiProviders().find(p => p.id === providerId);
    const models = provider?.video_models || DEFAULT_VIDEO_MODELS;
    return [...new Set(models)];
}
function volcengineVideoModels(){
    const provider = (apiProviders || []).find(p => p.id === 'volcengine');
    return [...new Set(provider?.video_models || DEFAULT_VIDEO_MODELS)];
}
function renderVideoProviderControl(providers){
    const current = (providers || []).find(p => p.id === settings.videoProvider) || videoProviderById(settings.videoProvider);
    return `<div class="smart-control provider-control">
        <button class="smart-pill" type="button"><i data-lucide="plug-zap"></i><span class="sub">${escapeHtml(current?.name || settings.videoProvider || tr('smart.platform'))}</span></button>
        <div class="smart-popover compact-popover">
            <div class="smart-popover-title">${escapeHtml(tr('smart.videoPlatform'))}</div>
            <div class="model-list">
                ${providers.map(p => `<button type="button" class="direct-option ${p.id === settings.videoProvider ? 'active' : ''}" data-smart-param="videoProvider" data-smart-value="${escapeHtml(p.id)}"><span>${escapeHtml(p.name || p.id)}</span></button>`).join('') || `<div class="muted-note">${escapeHtml(tr('smart.noVideoPlatform'))}</div>`}
            </div>
        </div>
    </div>`;
}
function renderVideoModelControl(models){
    return `<div class="smart-control model-control">
        <button class="smart-pill" type="button"><i data-lucide="film"></i><span class="sub">${escapeHtml(settings.videoModel || tr('smart.model'))}</span></button>
        <div class="smart-popover compact-popover">
            <div class="smart-popover-title">${escapeHtml(tr('smart.videoModel'))}</div>
            <div class="model-list">
                ${models.map(m => `<button type="button" class="direct-option ${m === settings.videoModel ? 'active' : ''}" data-smart-param="videoModel" data-smart-value="${escapeHtml(m)}"><span>${escapeHtml(m)}</span></button>`).join('') || `<div class="muted-note">${escapeHtml(tr('smart.noVideoModel'))}</div>`}
            </div>
        </div>
    </div>`;
}
function renderVideoDurationControl(){
    const v = Math.max(1, Math.min(60, Number(settings.videoDuration) || 5));
    const quick = [3, 4, 5, 6, 8, 10, 12, 15];
    return `<div class="smart-control duration-control" title="${escapeHtml(tr('smart.videoDurationTip'))}">
        <button class="smart-pill" type="button"><i data-lucide="timer"></i><span>${v}s</span></button>
        <div class="smart-popover compact-popover">
            <div class="smart-popover-title">${escapeHtml(tr('smart.videoDuration'))}</div>
            <div class="duration-grid">
                ${quick.map(n => `<button type="button" class="duration-option ${n === v ? 'active' : ''}" data-smart-param="videoDuration" data-smart-value="${n}">${n}s</button>`).join('')}
            </div>
            <label class="duration-custom">
                <span>${escapeHtml(tr('smart.custom'))}</span>
                <input type="number" min="1" max="60" step="1" data-param="videoDuration" value="${v}">
            </label>
        </div>
    </div>`;
}
function renderVideoAspectControl(){
    const options = [
        ['16:9','16:9'], ['9:16','9:16'], ['1:1','1:1'], ['4:3','4:3'], ['3:4','3:4'],
        ['21:9','21:9'], ['9:21','9:21'], ['keep_ratio', tr('smart.videoAspectKeep')], ['adaptive', tr('smart.videoAspectAdaptive')]
    ];
    const value = settings.videoAspect || '16:9';
    const labelMap = Object.fromEntries(options);
    return `<div class="smart-control aspect-control">
        <button class="smart-pill" type="button"><i data-lucide="scan"></i><span>${escapeHtml(labelMap[value] || value)}</span></button>
        <div class="smart-popover">
            <div class="smart-popover-title">${escapeHtml(tr('smart.videoAspect'))}</div>
            <div class="ratio-grid">
                ${options.map(([v,l]) => `<button type="button" class="ratio-option ${v === value ? 'active' : ''}" data-smart-param="videoAspect" data-smart-value="${escapeHtml(v)}"><span class="ratio-icon ${videoAspectIconClass(v)}"></span><span>${escapeHtml(l)}</span></button>`).join('')}
            </div>
        </div>
    </div>`;
}
function renderVideoResolutionControl(){
    const options = [['', tr('smart.videoResAuto')], ['480p','480P'], ['720p','720P'], ['1080p','1080P']];
    const value = settings.videoResolution || '';
    const labelMap = Object.fromEntries(options);
    return `<div class="smart-control resolution-control">
        <button class="smart-pill" type="button"><i data-lucide="monitor"></i><span>${escapeHtml(labelMap[value] || value || tr('smart.videoResAuto'))}</span></button>
        <div class="smart-popover compact-popover">
            <div class="smart-popover-title">${escapeHtml(tr('smart.videoResolution'))}</div>
            <div class="model-list">
                ${options.map(([v,l]) => `<button type="button" class="direct-option ${v === value ? 'active' : ''}" data-smart-param="videoResolution" data-smart-value="${escapeHtml(v)}"><span>${escapeHtml(l)}</span></button>`).join('')}
            </div>
        </div>
    </div>`;
}
function renderVideoToggleControl(key, label){
    const on = !!settings[key];
    return `<button type="button" class="setting-check ${on ? 'active' : ''}" data-toggle-param="${escapeHtml(key)}"><span class="check-box"></span><span>${escapeHtml(label)}</span></button>`;
}
function renderTempShUploadControl(){
    return `<button type="button" class="smart-pill cloud-upload-pill" data-temp-sh-upload-video title="上传当前输入图片或视频到云端直链"><i data-lucide="upload-cloud"></i><span>上传云端</span></button>`;
}
function renderManualVideoUrlControl(){
    return `<button type="button" class="smart-pill manual-video-url-pill" data-manual-video-url title="手动输入媒体 URL"><i data-lucide="link"></i><span>输入网址</span></button>`;
}
// 可信素材模式：打开后可选择素材来源——素材库认证链接 / 自行上传云端 / 自行输入网址。
function renderVideoTrustedAssetControl(){
    const on = !!settings.videoTrustedAsset;
    let html = renderVideoToggleControl('videoTrustedAsset', tr('smart.videoTrustedAsset'));
    if(!on) return html;
    const src = ['library','cloud','manual'].includes(settings.videoTrustedSource) ? settings.videoTrustedSource : 'library';
    html += `<div class="trusted-source-row">
        <button type="button" class="smart-pill trusted-src-pill ${src === 'library' ? 'active' : ''}" data-trusted-source="library" title="使用素材库中已注册的认证素材链接（asset://）"><i data-lucide="library"></i><span>素材库链接</span></button>
        <button type="button" class="smart-pill trusted-src-pill ${src === 'cloud' ? 'active' : ''}" data-trusted-source="cloud" title="把当前输入图片/视频上传到云端直链"><i data-lucide="upload-cloud"></i><span>上传云端</span></button>
        <button type="button" class="smart-pill trusted-src-pill ${src === 'manual' ? 'active' : ''}" data-trusted-source="manual" title="手动输入媒体 URL 或 asset:// 地址"><i data-lucide="link"></i><span>输入网址</span></button>
    </div>`;
    return html;
}
function optionHtml(value, label, selected){
    return `<option value="${escapeHtml(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${escapeHtml(label ?? value)}</option>`;
}
function parseSizeValue(value){
    const match = String(value || '').trim().match(/^(\d+)\s*[xX*]\s*(\d+)$/);
    return match ? {width:match[1], height:match[2]} : null;
}
function parseRatioValue(value){
    const raw = String(value || '').trim();
    const parts = raw.includes(':') ? raw.split(':') : raw.split(/[xX*]/);
    if(parts.length !== 2) return 0;
    const w = Number(parts[0]);
    const h = Number(parts[1]);
    return w > 0 && h > 0 ? w / h : 0;
}
function apiImageSize(ratioValue, resolutionValue, customRatioValue='', customSizeValue=''){
    if(resolutionValue === 'auto') return 'auto';
    if(resolutionValue === 'custom') return String(customSizeValue || '').trim();
    const resolutionKey = resolutionValue || '1k';
    if(ratioValue === 'custom' || ratioValue === 'source'){
        const parsed = parseRatioValue(customRatioValue);
        const longSide = RES_LONG_SIDE[resolutionKey] || 1024;
        if(parsed){
            const pixelLimit = RES_PIXEL_LIMIT[resolutionKey] || (longSide * longSide);
            const rawWidth = parsed >= 1 ? longSide : Math.min(longSide * parsed, Math.sqrt(pixelLimit * parsed));
            const rawHeight = parsed >= 1 ? Math.min(longSide / parsed, Math.sqrt(pixelLimit / parsed)) : longSide;
            const width = Math.floor(rawWidth / 16) * 16;
            const height = Math.floor(rawHeight / 16) * 16;
            return `${Math.max(64, width)}x${Math.max(64, height)}`;
        }
    }
    const ratioKey = ratioValue && SIZE_MAP[ratioValue] ? ratioValue : 'square';
    return SIZE_MAP[ratioKey]?.[resolutionKey] || SIZE_MAP.square[resolutionKey] || SIZE_MAP.square['1k'];
}
function normalizeApiSizeSettings(prefix=''){
    const ratioKey = prefix ? `${prefix}Ratio` : 'ratio';
    const resKey = prefix ? `${prefix}Resolution` : 'resolution';
    const allowAuto = !prefix && settings.engine === 'api' && settings.apiKind !== 'video' && isGptImageAutoSizeModel(settings.model);
    if(!settings[resKey]) settings[resKey] = allowAuto ? 'auto' : '1k';
    if(!allowAuto && settings[resKey] === 'auto') settings[resKey] = '1k';
    if(settings[resKey] === 'auto' && !settings[ratioKey]) settings[ratioKey] = 'square';
}
function updateProviderModels(){ renderDynamicParams(); }
function controlTypeKey(el){
    return el ? Array.from(el.classList).find(c => c !== 'smart-control' && c.endsWith('-control')) || '' : '';
}
// 记住重渲染前哪个控件的弹层是打开的：pinned=点击药丸锁定，interacting=悬浮打开后点了里面的参数。
// 重渲染会重建 DOM、丢掉这两个状态，所以渲染后要按原样恢复，否则点一下就收起来了。
function openControlState(){
    const el = dynamicParams?.querySelector('.smart-control.pinned, .smart-control.interacting');
    const key = controlTypeKey(el);
    if(!key) return null;
    return { key, pinned: el.classList.contains('pinned'), interacting: el.classList.contains('interacting') };
}
function restoreOpenControl(state){
    if(!state) return;
    const match = dynamicParams?.querySelector(`.smart-control.${state.key}`);
    if(!match) return;
    if(state.pinned) match.classList.add('pinned');
    if(state.interacting) match.classList.add('interacting');
}
function renderDynamicParams(){
    if(!dynamicParams) return;
    const keepOpen = openControlState();
    settings.engine = normalizeSmartEngine(settings.engine);
    settings.apiKind = settings.apiKind === 'video' ? 'video' : 'image';
    clearVolcengineSelectionOutsideVolcengine(settings);
    engineSelect.value = settings.engine;
    syncApiKindToggleVisibility();
    if(settings.engine === 'api'){
        if(settings.apiKind === 'video') renderApiVideoParams();
        else renderApiParams();
    }
    else if(settings.engine === 'volcengine'){
        if(settings.apiKind === 'video') renderVolcengineVideoParams();
        else renderVolcengineParams();
    }
    else if(settings.engine === 'modelscope') renderMsParams();
    else renderApiParams();
    bindDynamicParams();
    restoreOpenControl(keepOpen);
    updatePromptPlaceholder();
    persistActiveSmartSettings();
    if(window.lucide) lucide.createIcons();
}
function renderApiParams(){
    const providers = imageProviders();
    if(!settings.provider_id || !providers.some(p => p.id === settings.provider_id)) settings.provider_id = providers[0]?.id || '';
    const models = filterJimengImageModels(providerImageModels(settings.provider_id));
    if(!settings.model || !models.includes(settings.model)) settings.model = models[0] || '';
    // 切换平台/模型时保留用户已选的分辨率（记忆），normalizeApiSizeSettings 只会修正非法的 auto。
    normalizeApiSizeSettings('');
    const outpaintLocked = settings.outpaintResolutionLocked === true;
    dynamicParams.innerHTML = `
        ${renderProviderControl(providers)}
        ${renderModelControl(models)}
        ${renderSizePickerControl('', true)}
        ${renderQualityControl()}
        ${renderCountVisualControl()}
    `;
}
function renderApiVideoParams(){
    const providers = videoApiProviders();
    if(!settings.videoProvider || !providers.some(p => p.id === settings.videoProvider)) settings.videoProvider = providers[0]?.id || 'comfly';
    const models = filterJimengVideoModels(providerVideoModels(settings.videoProvider));
    if(!settings.videoModel || !models.includes(settings.videoModel)) settings.videoModel = models[0] || 'veo3-fast';
    dynamicParams.innerHTML = `
        ${renderVideoProviderControl(providers)}
        ${renderVideoModelControl(models)}
        ${renderVideoResolutionControl()}
        ${renderVideoAspectControl()}
        ${renderVideoDurationControl()}
        ${renderVideoToggleControl('videoEnhancePrompt', tr('smart.videoEnhancePrompt'))}
        ${renderVideoToggleControl('videoEnableUpsample', tr('smart.videoUpsample'))}
        ${renderVideoToggleControl('videoGenerateAudio', tr('smart.videoGenerateAudio'))}
        ${renderVideoToggleControl('videoCameraFixed', tr('smart.videoCameraFixed'))}
        ${renderVideoToggleControl('videoWatermark', tr('smart.videoWatermark'))}
        ${renderVideoToggleControl('videoMultimodal', tr('smart.videoMultimodal'))}
        ${renderVideoToggleControl('videoUseFrameRoles', tr('smart.videoUseFrameRoles'))}
        ${settings.videoProvider === 'jimeng' ? '' : renderVideoTrustedAssetControl()}
    `;
}
function renderVolcengineParams(){
    const provider = volcengineProvider();
    const providers = [provider];
    const models = providerImageModels('volcengine');
    settings.provider_id = 'volcengine';
    if(!settings.model || !models.includes(settings.model)) settings.model = models[0] || '';
    normalizeApiSizeSettings('');
    const outpaintLocked = settings.outpaintResolutionLocked === true;
    dynamicParams.innerHTML = `
        ${renderProviderControl(providers)}
        ${renderModelControl(models)}
        ${renderSizePickerControl('', true)}
        ${renderQualityControl()}
        ${renderCountVisualControl()}
    `;
}
function renderVolcengineVideoParams(){
    const provider = volcengineProvider();
    const providers = [provider];
    const models = volcengineVideoModels();
    settings.videoProvider = 'volcengine';
    if(!settings.videoModel || !models.includes(settings.videoModel)) settings.videoModel = models[0] || 'seedance-1.0-pro';
    dynamicParams.innerHTML = `
        ${renderVideoProviderControl(providers)}
        ${renderVideoModelControl(models)}
        ${renderVideoResolutionControl()}
        ${renderVideoAspectControl()}
        ${renderVideoDurationControl()}
        ${renderVideoToggleControl('videoEnhancePrompt', tr('smart.videoEnhancePrompt'))}
        ${renderVideoToggleControl('videoEnableUpsample', tr('smart.videoUpsample'))}
        ${renderVideoToggleControl('videoGenerateAudio', tr('smart.videoGenerateAudio'))}
        ${renderVideoToggleControl('videoCameraFixed', tr('smart.videoCameraFixed'))}
        ${renderVideoToggleControl('videoWatermark', tr('smart.videoWatermark'))}
        ${renderVideoToggleControl('videoMultimodal', tr('smart.videoMultimodal'))}
        ${renderVideoToggleControl('videoUseFrameRoles', tr('smart.videoUseFrameRoles'))}
        ${renderVideoTrustedAssetControl()}
    `;
}
function renderMsParams(){
    settings.msgenModel = MS_GEN_MODELS[settings.msgenModel] ? settings.msgenModel : 'zimage';
    if(!settings.msCustomModel) settings.msCustomModel = modelscopeImageModels()[0] || 'Tongyi-MAI/Z-Image-Turbo';
    normalizeApiSizeSettings('ms');
    dynamicParams.innerHTML = `
        ${renderMsFunctionControl()}
        ${renderMsCustomModelPill()}
        ${renderSizePickerControl('ms', false)}
        ${renderCountVisualControl()}
    `;
}
function renderSizeControls(prefix='', includeSource=false){
    const ratioKey = prefix ? `${prefix}Ratio` : 'ratio';
    const resKey = prefix ? `${prefix}Resolution` : 'resolution';
    const ratios = [
        ['square','1:1'], ['portrait','2:3'], ['landscape','3:2'], ['portrait43','3:4'], ['landscape43','4:3'], ['story','9:16'], ['wide','16:9'], ['ultrawide','21:9'], ['ultratall','9:21'],
        ...(includeSource ? [['source', tr('canvas.adaptiveRatio') || '适配比例']] : []),
        ['custom', tr('canvas.custom') || '自定义']
    ];
    const resolutionOptions = (!prefix && settings.engine === 'api') ? ['auto','1k','2k','4k','custom'] : ['1k','2k','4k','custom'];
    return `<select data-param="${resKey}">
            ${resolutionOptions.map(v => optionHtml(v, v === 'auto' ? '自动' : (v === 'custom' ? (tr('canvas.custom') || '自定义') : v.toUpperCase()), settings[resKey] || (prefix ? '1k' : defaultSmartApiResolution(settings.model)))).join('')}
        </select>
        <select data-param="${ratioKey}" ${settings[resKey] === 'custom' || settings[resKey] === 'auto' ? 'disabled' : ''}>
            ${ratios.map(([v,l]) => `<option value="${escapeHtml(v)}" ${v === (settings[ratioKey] || 'square') ? 'selected' : ''}>${escapeHtml(l)}</option>`).join('')}
        </select>`;
}
function ratioLabel(prefix=''){
    const ratioKey = prefix ? `${prefix}Ratio` : 'ratio';
    const customKey = prefix ? `${prefix}CustomRatio` : 'customRatio';
    const sourceLabel = sourceImageRatioLabel(prefix) || tr('smart.imageRatio');
    const map = {square:'1:1', portrait:'2:3', landscape:'3:2', portrait43:'3:4', landscape43:'4:3', story:'9:16', wide:'16:9', ultrawide:'21:9', ultratall:'9:21', source:sourceLabel, custom:settings[customKey] || tr('smart.custom')};
    return map[settings[ratioKey] || 'square'] || '1:1';
}
function gcdInt(a, b){
    a = Math.abs(Math.round(Number(a) || 0));
    b = Math.abs(Math.round(Number(b) || 0));
    while(b){ const t = b; b = a % b; a = t; }
    return a || 1;
}
function imageSizeForRatio(img){
    const w = Math.round(Number(img?.natural_w || img?.width || img?.w || 0));
    const h = Math.round(Number(img?.natural_h || img?.height || img?.h || 0));
    return w > 0 && h > 0 ? {w, h} : null;
}
function sourceRatioImageForNode(node){
    const images = (node?.images || []).filter(img => img?.url && !isAudioMediaItem(img));
    if(!images.length) return null;
    if(selectedImage.nodeId === node?.id && selectedImage.index >= 0 && imagesForNode(node)[selectedImage.index]){
        const selected = imagesForNode(node)[selectedImage.index];
        if(imageSizeForRatio(selected)) return selected;
    }
    return images.find(img => imageSizeForRatio(img)) || images[0];
}
function reducedRatioForImage(img){
    const size = imageSizeForRatio(img);
    if(!size) return null;
    const d = gcdInt(size.w, size.h);
    return {w:Math.max(1, Math.round(size.w / d)), h:Math.max(1, Math.round(size.h / d))};
}
function sourceImageRatioLabel(prefix=''){
    const node = activeComposerNode() || selectedNode();
    const ratio = reducedRatioForImage(sourceRatioImageForNode(node));
    if(!ratio) return '';
    return `${ratio.w}:${ratio.h}`;
}
function applySourceRatioToSettings(prefix=''){
    const ratioKey = prefix ? `${prefix}Ratio` : 'ratio';
    if(settings[ratioKey] !== 'source') return;
    const ratio = reducedRatioForImage(sourceRatioImageForNode(activeComposerNode() || selectedNode()));
    if(!ratio) return;
    const customKey = prefix ? `${prefix}CustomRatio` : 'customRatio';
    const wKey = prefix ? `${prefix}CustomRatioWidth` : 'customRatioWidth';
    const hKey = prefix ? `${prefix}CustomRatioHeight` : 'customRatioHeight';
    settings[wKey] = ratio.w;
    settings[hKey] = ratio.h;
    settings[customKey] = `${ratio.w}:${ratio.h}`;
}
function resolutionLabel(prefix=''){
    const resKey = prefix ? `${prefix}Resolution` : 'resolution';
    const sizeKey = prefix ? `${prefix}CustomSize` : 'customSize';
    const value = settings[resKey] || ((!prefix && settings.engine === 'api') ? defaultSmartApiResolution(settings.model) : '1k');
    if(value === 'auto') return '自动';
    return value === 'custom' ? (settings[sizeKey] || tr('smart.custom')) : value.toUpperCase();
}
function ratioIconClass(value){
    if(value === 'portrait') return 'r-portrait';
    if(value === 'portrait43') return 'r-portrait43';
    if(value === 'landscape') return 'r-landscape';
    if(value === 'landscape43') return 'r-landscape43';
    if(value === 'wide' || value === 'ultrawide') return 'r-wide';
    if(value === 'story' || value === 'ultratall') return 'r-story';
    if(value === 'source') return 'r-source';
    if(value === 'custom') return 'r-custom';
    return '';
}
function videoAspectIconClass(value){
    if(value === '16:9' || value === '21:9') return 'r-wide';
    if(value === '9:16' || value === '9:21') return 'r-story';
    if(value === '4:3') return 'r-landscape43';
    if(value === '3:4') return 'r-portrait43';
    if(value === 'keep_ratio' || value === 'adaptive') return 'r-source';
    return '';
}
function renderProviderControl(providers){
    const current = (providers || []).find(p => p.id === settings.provider_id) || apiProviderById(settings.provider_id);
    return `<div class="smart-control provider-control">
        <button class="smart-pill" type="button"><i data-lucide="plug-zap"></i><span class="sub">${escapeHtml(current?.name || settings.provider_id || tr('smart.platform'))}</span></button>
        <div class="smart-popover compact-popover">
            <div class="smart-popover-title">${escapeHtml(tr('smart.apiPlatform'))}</div>
            <div class="model-list">
                ${providers.map(p => `<button type="button" class="direct-option ${p.id === settings.provider_id ? 'active' : ''}" data-smart-param="provider_id" data-smart-value="${escapeHtml(p.id)}"><span>${escapeHtml(p.name || p.id)}</span></button>`).join('') || `<div class="muted-note">${escapeHtml(tr('smart.noApiPlatform'))}</div>`}
            </div>
        </div>
    </div>`;
}
function renderModelControl(models){
    return `<div class="smart-control model-control">
        <button class="smart-pill" type="button"><i data-lucide="sparkles"></i><span class="sub">${escapeHtml(settings.model || tr('smart.model'))}</span></button>
        <div class="smart-popover compact-popover">
            <div class="smart-popover-title">${escapeHtml(tr('smart.imageModel'))}</div>
            <div class="model-list">
                ${models.map(m => `<button type="button" class="direct-option ${m === settings.model ? 'active' : ''}" data-smart-param="model" data-smart-value="${escapeHtml(m)}"><span>${escapeHtml(m)}</span></button>`).join('') || `<div class="muted-note">${escapeHtml(tr('smart.noImageModel'))}</div>`}
            </div>
        </div>
    </div>`;
}
function msModelLabel(key){
    if(key === 'custom') return tr('smart.custom');
    return MS_GEN_MODELS[key]?.label || key;
}
function renderMsFunctionControl(){
    return `<div class="smart-control provider-control">
        <button class="smart-pill" type="button"><i data-lucide="sparkles"></i><span class="sub">${escapeHtml(msModelLabel(settings.msgenModel) || 'Modelscope')}</span></button>
        <div class="smart-popover compact-popover">
            <div class="smart-popover-title">${escapeHtml(tr('smart.msFunction'))}</div>
            <div class="model-list">
                ${Object.entries(MS_GEN_MODELS).map(([key]) => `<button type="button" class="direct-option ${key === settings.msgenModel ? 'active' : ''}" data-smart-param="msgenModel" data-smart-value="${escapeHtml(key)}"><span>${escapeHtml(msModelLabel(key))}</span></button>`).join('')}
            </div>
        </div>
    </div>`;
}
function renderMsCustomModelPill(){
    if(settings.msgenModel !== 'custom') return '';
    const models = modelscopeImageModels();
    const label = settings.msCustomModel || tr('smart.customModel');
    return `<div class="smart-control model-control">
        <button class="smart-pill" type="button"><i data-lucide="boxes"></i><span class="sub">${escapeHtml(label)}</span></button>
        <div class="smart-popover compact-popover">
            <div class="smart-popover-title">${escapeHtml(tr('smart.msCustomModel'))}</div>
            <div class="model-list">
                ${models.map(m => `<button type="button" class="direct-option ${m === settings.msCustomModel ? 'active' : ''}" data-smart-param="msCustomModel" data-smart-value="${escapeHtml(m)}"><span>${escapeHtml(m)}</span></button>`).join('') || `<div class="muted-note">${escapeHtml(tr('smart.noMsModel'))}</div>`}
            </div>
        </div>
    </div>`;
}
function renderRatioControl(prefix='', includeSource=false){
    const ratioKey = prefix ? `${prefix}Ratio` : 'ratio';
    const resKey = prefix ? `${prefix}Resolution` : 'resolution';
    const ratios = [
        ['square','1:1'], ['portrait','2:3'], ['landscape','3:2'], ['portrait43','3:4'], ['landscape43','4:3'],
        ['story','9:16'], ['wide','16:9'], ['ultrawide','21:9'], ['ultratall','9:21'],
        ...(includeSource ? [['source', tr('smart.imageRatio')]] : []),
        ['custom', tr('smart.custom')]
    ];
    return `<div class="smart-control ratio-control">
        <button class="smart-pill" type="button"><i data-lucide="scan"></i><span>${escapeHtml(ratioLabel(prefix))}</span></button>
        <div class="smart-popover">
            <div class="smart-popover-title">${escapeHtml(tr('smart.ratio'))}</div>
            <div class="ratio-grid">
                ${ratios.map(([value, label]) => `<button type="button" class="ratio-option ${value === (settings[ratioKey] || 'square') ? 'active' : ''}" data-smart-param="${ratioKey}" data-smart-value="${escapeHtml(value)}"><span class="ratio-icon ${ratioIconClass(value)}"></span><span>${escapeHtml(label)}</span></button>`).join('')}
            </div>
        </div>
    </div>`;
}
function renderResolutionControl(prefix=''){
    const resKey = prefix ? `${prefix}Resolution` : 'resolution';
    const options = (!prefix && settings.engine === 'api') ? ['auto','1k','2k','4k','custom'] : ['1k','2k','4k','custom'];
    const current = settings[resKey] || ((!prefix && settings.engine === 'api') ? defaultSmartApiResolution(settings.model) : '1k');
    const allowAuto = !prefix && settings.engine === 'api' && settings.apiKind !== 'video' && isGptImageAutoSizeModel(settings.model);
    return `<div class="smart-control resolution-control">
        <button class="smart-pill" type="button"><i data-lucide="monitor"></i><span>${escapeHtml(resolutionLabel(prefix))}</span></button>
        <div class="smart-popover compact-popover">
            <div class="smart-popover-title">${escapeHtml(tr('smart.resolution'))}</div>
            <div class="seg-row">
                ${options.map(value => `<button type="button" class="${value === current ? 'active' : ''}" data-smart-param="${resKey}" data-smart-value="${value}" ${value === 'auto' && !allowAuto ? 'disabled' : ''}>${value === 'auto' ? '自动' : (value === 'custom' ? escapeHtml(tr('smart.custom')) : value.toUpperCase())}</button>`).join('')}
            </div>
        </div>
    </div>`;
}
function sizePickerScope(prefix=''){
    const resKey = prefix ? `${prefix}Resolution` : 'resolution';
    const ratioKey = prefix ? `${prefix}Ratio` : 'ratio';
    const value = settings[resKey] || ((!prefix && settings.engine === 'api') ? defaultSmartApiResolution(settings.model) : '1k');
    if(value === 'auto') return 'auto';
    if(value === 'custom' || settings[ratioKey] === 'custom') return 'custom';
    return 'preset';
}
function sizePickerDefaultResolution(prefix=''){
    const value = (!prefix && settings.engine === 'api') ? defaultSmartApiResolution(settings.model) : '1k';
    return value === 'auto' ? '1k' : value;
}
function sizePickerLabel(prefix=''){
    const scope = sizePickerScope(prefix);
    if(scope === 'auto') return '自动';
    if(scope === 'custom'){
        const resKey = prefix ? `${prefix}Resolution` : 'resolution';
        const ratioKey = prefix ? `${prefix}Ratio` : 'ratio';
        const resText = resolutionLabel(prefix);
        const ratioText = ratioLabel(prefix);
        if(settings[resKey] === 'custom' && settings[ratioKey] === 'custom') return `自定义 · ${resText} · ${ratioText}`;
        if(settings[resKey] === 'custom') return `自定义 · ${resText}`;
        if(settings[ratioKey] === 'custom') return `自定义 · ${ratioText} · ${resText}`;
        return `自定义 · ${resText}`;
    }
    return `${ratioLabel(prefix)} · ${resolutionLabel(prefix)}`;
}
function renderSizePickerControl(prefix='', includeSource=false){
    const ratioKey = prefix ? `${prefix}Ratio` : 'ratio';
    const resKey = prefix ? `${prefix}Resolution` : 'resolution';
    const scope = sizePickerScope(prefix);
    const options = (!prefix && settings.engine === 'api') ? ['auto','1k','2k','4k'] : ['1k','2k','4k'];
    const currentRes = settings[resKey] || ((!prefix && settings.engine === 'api') ? defaultSmartApiResolution(settings.model) : '1k');
    const currentRatio = settings[ratioKey] || 'square';
    const allowAuto = !prefix && settings.engine === 'api' && settings.apiKind !== 'video' && isGptImageAutoSizeModel(settings.model);
    const ratios = [
        ['square','1:1','正方形'], ['portrait','2:3','竖图'], ['landscape','3:2','横图'], ['portrait43','3:4','竖图'], ['landscape43','4:3','横图'],
        ['story','9:16','竖屏'], ['wide','16:9','宽屏'], ['ultrawide','21:9','超宽'], ['ultratall','9:21','超竖'],
        ...(includeSource ? [['source', sourceImageRatioLabel(prefix) || '原图', '适配输入']] : [])
    ];
    const wKey = prefix ? `${prefix}CustomWidth` : 'customWidth';
    const hKey = prefix ? `${prefix}CustomHeight` : 'customHeight';
    return `<div class="smart-control size-picker-control ${scope === 'auto' ? 'auto-mode' : ''} ${scope === 'custom' ? 'custom-mode' : ''}">
        <button class="smart-pill size-picker-pill" type="button"><i data-lucide="scan-line"></i><span class="size-picker-label"><span class="size-picker-type">尺寸</span><span class="size-picker-dot"></span><span class="size-picker-value">${escapeHtml(sizePickerLabel(prefix))}</span></span></button>
        <div class="smart-popover size-picker-popover">
            <div class="size-picker-head">
                <div class="smart-popover-title">尺寸选择</div>
                <div class="size-picker-scope">
                    <button type="button" class="${scope === 'auto' ? 'active' : ''}" data-size-scope="auto" data-size-prefix="${escapeHtml(prefix)}" ${allowAuto ? '' : 'disabled'}>自动</button>
                    <button type="button" class="${scope === 'preset' ? 'active' : ''}" data-size-scope="preset" data-size-prefix="${escapeHtml(prefix)}">系统参数</button>
                    <button type="button" class="${scope === 'custom' ? 'active' : ''}" data-size-scope="custom" data-size-prefix="${escapeHtml(prefix)}">自定义</button>
                </div>
            </div>
            ${scope === 'auto' ? `<div class="size-picker-pane size-picker-auto"><div class="size-picker-note"><strong>自动尺寸</strong><span>使用模型默认尺寸，或由支持自动尺寸的模型自行决定。</span></div></div>` : ''}
            ${scope === 'preset' ? `<div class="size-picker-pane size-picker-preset">
                <div class="size-picker-list">
                    ${ratios.map(([value, label, sub]) => `<button type="button" class="size-picker-option ${value === currentRatio ? 'active' : ''}" data-smart-param="${ratioKey}" data-smart-value="${escapeHtml(value)}"><span>${escapeHtml(label)}</span><small>${escapeHtml(sub)}</small></button>`).join('')}
                </div>
                <div class="size-picker-list">
                    ${options.filter(v => v !== 'auto').map(value => `<button type="button" class="size-picker-option ${value === currentRes ? 'active' : ''}" data-smart-param="${resKey}" data-smart-value="${value}"><span>${value.toUpperCase()}</span><small>${escapeHtml(apiImageSize(currentRatio === 'source' ? 'square' : currentRatio, value, settings[prefix ? `${prefix}CustomRatio` : 'customRatio'] || '', '') || '')}</small></button>`).join('')}
                </div>
            </div>` : ''}
            ${scope === 'custom' ? `<div class="size-picker-pane size-picker-custom">
                <div class="size-custom-box">
                    <div class="size-custom-title">自定义分辨率</div>
                    <div class="size-custom-row"><input type="number" data-param="${wKey}" value="${escapeHtml(settings[wKey] || '')}" placeholder="宽度"><span>×</span><input type="number" data-param="${hKey}" value="${escapeHtml(settings[hKey] || '')}" placeholder="高度"></div>
                </div>
            </div>` : ''}
        </div>
    </div>`;
}
function renderInlineCustomRatioFields(prefix=''){
    const ratioKey = prefix ? `${prefix}Ratio` : 'ratio';
    if(settings[ratioKey] === 'source') return '';
    if(settings[ratioKey] !== 'custom') return '';
    const wKey = prefix ? `${prefix}CustomRatioWidth` : 'customRatioWidth';
    const hKey = prefix ? `${prefix}CustomRatioHeight` : 'customRatioHeight';
    return `<div class="inline-fields">
        <span class="inline-label">${escapeHtml(tr('smart.ratio'))}</span>
        <input type="number" data-param="${wKey}" value="${escapeHtml(settings[wKey] || '')}" placeholder="W">
        <span class="inline-divider">:</span>
        <input type="number" data-param="${hKey}" value="${escapeHtml(settings[hKey] || '')}" placeholder="H">
    </div>`;
}
function renderInlineCustomSizeFields(prefix=''){
    const resKey = prefix ? `${prefix}Resolution` : 'resolution';
    if(settings[resKey] !== 'custom') return '';
    const wKey = prefix ? `${prefix}CustomWidth` : 'customWidth';
    const hKey = prefix ? `${prefix}CustomHeight` : 'customHeight';
    return `<div class="inline-fields">
        <span class="inline-label">${escapeHtml(tr('smart.size'))}</span>
        <input type="number" data-param="${wKey}" value="${escapeHtml(settings[wKey] || '')}" placeholder="${escapeHtml(tr('smart.width'))}">
        <span class="inline-divider">×</span>
        <input type="number" data-param="${hKey}" value="${escapeHtml(settings[hKey] || '')}" placeholder="${escapeHtml(tr('smart.height'))}">
    </div>`;
}
function renderQualityControl(){
    const value = settings.quality || 'auto';
    const labels = {auto:tr('smart.qualityAuto'), low:tr('smart.qualityLow'), medium:tr('smart.qualityMid'), high:tr('smart.qualityHigh')};
    return `<div class="smart-control quality-control">
        <button class="smart-pill" type="button"><i data-lucide="sliders-horizontal"></i><span>${escapeHtml(labels[value] || value)}</span></button>
        <div class="smart-popover compact-popover">
            <div class="smart-popover-title">${escapeHtml(tr('smart.quality'))}</div>
            <div class="seg-row">
                ${Object.entries(labels).map(([k, l]) => `<button type="button" class="${k === value ? 'active' : ''}" data-smart-param="quality" data-smart-value="${escapeHtml(k)}">${escapeHtml(l)}</button>`).join('')}
            </div>
        </div>
    </div>`;
}
function renderCountVisualControl(){
    const value = Number(settings.count || 1);
    return `<div class="smart-control count-control">
        <button class="smart-pill" type="button"><i data-lucide="copy"></i><span>${value}${tr('smart.countUnit') ? ' ' + escapeHtml(tr('smart.countUnit')) : ''}</span></button>
        <div class="smart-popover compact-popover" style="min-width:170px">
            <div class="smart-popover-title">${escapeHtml(tr('smart.count'))}</div>
            <div class="count-grid">
                ${[1,2,3,4,5,6,7,8].map(n => `<button type="button" class="count-cell ${n === value ? 'active' : ''}" data-smart-param="count" data-smart-value="${n}">${n}</button>`).join('')}
            </div>
        </div>
    </div>`;
}
function renderCountControl(){
    return `<select data-param="count">${[1,2,3,4,5,6,7,8].map(n => optionHtml(n, `${n} 张`, Number(settings.count || 1))).join('')}</select>`;
}
function renderCustomRatioControls(prefix=''){
    const ratioKey = prefix ? `${prefix}Ratio` : 'ratio';
    if(settings[ratioKey] !== 'custom' && settings[ratioKey] !== 'source') return '';
    const wKey = prefix ? `${prefix}CustomRatioWidth` : 'customRatioWidth';
    const hKey = prefix ? `${prefix}CustomRatioHeight` : 'customRatioHeight';
    const disabled = settings[ratioKey] === 'source' ? 'disabled' : '';
    return `<input type="number" data-param="${wKey}" value="${escapeHtml(settings[wKey] || '')}" placeholder="比例宽" ${disabled}>
            <input type="number" data-param="${hKey}" value="${escapeHtml(settings[hKey] || '')}" placeholder="比例高" ${disabled}>`;
}
function renderCustomSizeControls(prefix=''){
    const resKey = prefix ? `${prefix}Resolution` : 'resolution';
    if(settings[resKey] !== 'custom') return '';
    const wKey = prefix ? `${prefix}CustomWidth` : 'customWidth';
    const hKey = prefix ? `${prefix}CustomHeight` : 'customHeight';
    return `<input type="number" data-param="${wKey}" value="${escapeHtml(settings[wKey] || '')}" placeholder="宽度">
            <input type="number" data-param="${hKey}" value="${escapeHtml(settings[hKey] || '')}" placeholder="高度">`;
}
function updatePromptPlaceholder(){
    if(!promptInput) return;
    promptInput.dataset.placeholder = tr('smart.promptPlaceholder');
}
function tempShUploadedUrlFor(url, sourceSettings=settings){
    const source = String(url || '');
    const manualLinks = ((sourceSettings || settings).videoTempShLinks || []).filter(item => item?.manual === true);
    const links = [...(transientSmartCloudLinks || []), ...manualLinks];
    const match = links.find(item =>
        item?.url && (item?.source === source || item?.originalLocalUrl === source || item?.url === source)
    );
    return match?.url || url;
}
function mediaRefSourceUrl(ref){
    return localDisplayUrlForMediaItem(ref) || ref?.sourceUrl || ref?.originalLocalUrl || ref?.url || '';
}
function applyUploadedUrlsToSmartRefs(refs, sourceSettings=settings){
    return (refs || []).map(ref => {
        if(!ref?.url) return ref;
        const sourceUrl = mediaRefSourceUrl(ref);
        const url = tempShUploadedUrlFor(sourceUrl, sourceSettings);
        return url && url !== ref.url ? {...ref, url, originalLocalUrl:ref.originalLocalUrl || ref.url} : ref;
    });
}
function manualSmartVideoLink(sourceSettings=settings){
    return ((sourceSettings || settings).videoTempShLinks || []).find(item => item?.manual === true && item?.url) || null;
}
function manualSmartMediaLinks(sourceSettings=settings){
    return ((sourceSettings || settings).videoTempShLinks || []).filter(item => item?.manual === true && item?.url);
}
function renderedInputMediaRefs(){
    if(!inputThumbsRow) return [];
    return [...inputThumbsRow.querySelectorAll('.input-thumb')].map((el, index) => ({
        url:el.dataset.url || '',
        sourceUrl:el.dataset.sourceUrl || el.dataset.url || '',
        nodeId:el.dataset.nodeId || '',
        imageIndex:Number.isFinite(Number(el.dataset.imageIndex)) ? Number(el.dataset.imageIndex) : index,
        name:tr('smart.inputNum').replace('{n}', String(index + 1)),
        role:`image_${index + 1}`
    })).filter(ref => ref.url);
}
function currentSmartMediaRefs(node){
    if(!node) return [];
    const request = buildPromptRequest(node, null, true, smartLoopContext);
    return (request.refs || []).filter(ref => ref?.url && ['image','video'].includes(mediaKindForItem(ref)));
}
function currentUploadMediaRefs(node){
    const rendered = renderedInputMediaRefs();
    if(rendered.length) return rendered;
    return currentSmartMediaRefs(node);
}
function currentSmartMediaLinks(node=null){
    return currentUploadMediaRefs(node || activeSettingsSubject()).map(ref => {
        const sourceUrl = mediaRefSourceUrl(ref);
        const uploaded = tempShUploadedUrlFor(sourceUrl);
        return uploaded && uploaded !== sourceUrl ? uploaded : '';
    }).filter(Boolean);
}
function clearManualSmartVideoUrl(){
    settings.videoTempShLinks = (settings.videoTempShLinks || []).filter(item => item?.manual !== true);
}
function splitManualMediaUrls(text){
    return String(text || '')
        .split(/[\s,，]+/)
        .map(url => url.trim())
        .filter(Boolean);
}
async function uploadMediaRefToCloud(ref){
    const kind = mediaKindForItem(ref);
    const sourceUrl = mediaRefSourceUrl(ref);
    if(!sourceUrl) throw new Error('没有可上传的媒体');
    const existing = tempShUploadedUrlFor(sourceUrl);
    if(existing && existing !== sourceUrl) return existing;
    if(/^https?:\/\//i.test(sourceUrl)) return sourceUrl;
    const response = await fetch('/api/cloud-video/upload', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({url:sourceUrl, service:'auto'})
    });
    if(!response.ok) throw new Error(await smartResponseErrorMessage(response, '云端上传失败'));
    const data = await response.json();
    const uploadedUrl = data.url || '';
    if(!uploadedUrl) throw new Error('云端没有返回链接');
    transientSmartCloudLinks = [
        ...(transientSmartCloudLinks || []).filter(item => item?.source !== sourceUrl),
        {source:sourceUrl, url:uploadedUrl, expires:data.expires || '3 days', kind}
    ];
    return uploadedUrl;
}
function applyManualVideoUrlToSmartRef(ref, manualUrl){
    if(!manualUrl) return;
    const sourceUrl = mediaRefSourceUrl(ref) || manualUrl;
    settings.videoTempShLinks = [
        ...(settings.videoTempShLinks || []).filter(item => item?.source !== sourceUrl),
        {source:sourceUrl, url:manualUrl, manual:true}
    ];
}
async function setCurrentSmartManualVideoUrl(){
    const node = activeSettingsSubject();
    if(!node) return '';
    savePromptDraftForCurrent();
    const refs = currentUploadMediaRefs(node);
    const firstLocal = refs.find(ref => ref?.url && !isRemoteVideoReferenceUrl(ref.url));
    const firstAny = firstLocal || refs[0] || null;
    const linkedUrls = currentSmartMediaLinks(node);
    const currentLinks = linkedUrls.length ? linkedUrls : (firstAny ? [tempShUploadedUrlFor(mediaRefSourceUrl(firstAny))] : []);
    const value = await openAssetNameDialog({
        title:refs.length > 1 ? `输入 ${refs.length} 个媒体网址 / 火山素材 URI` : '输入媒体网址 / 火山素材 URI',
        value:currentLinks.filter(isRemoteVideoReferenceUrl).join('\n'),
        placeholder:refs.length > 1 ? '每行一个链接，按图1/图2顺序对应' : 'https://example.com/media 或 asset://asset-xxx',
        cancelValue:null,
        multiline:refs.length > 1
    });
    if(value === null) return '';
    const urls = splitManualMediaUrls(value);
    if(!urls.length){
        clearManualSmartVideoUrl();
        persistActiveSmartSettings();
        scheduleSave();
        render();
        toast('已清除手动网址');
        return '';
    }
    const invalid = urls.find(url => !isRemoteVideoReferenceUrl(url));
    if(invalid){
        toast('请输入 http/https 媒体网址或 asset:// 火山素材 URI');
        return '';
    }
    clearManualSmartVideoUrl();
    const targets = refs.length ? refs : [firstAny].filter(Boolean);
    urls.forEach((url, index) => {
        const target = targets[index] || targets[targets.length - 1] || {url};
        applyManualVideoUrlToSmartRef(target, url);
    });
    persistActiveSmartSettings();
    scheduleSave();
    render();
    toast(`已设置 ${urls.length} 个媒体网址`);
    return urls[0] || '';
}
async function uploadCurrentSmartVideosToCloud(){
    const node = activeSettingsSubject();
    if(!node) return [];
    savePromptDraftForCurrent();
    const refs = currentUploadMediaRefs(node);
    const localRefs = refs.filter(ref => {
        const sourceUrl = ref?.sourceUrl || ref?.originalLocalUrl || ref?.url || '';
        if(!sourceUrl) return false;
        const uploaded = tempShUploadedUrlFor(sourceUrl);
        return uploaded !== sourceUrl || !isRemoteVideoReferenceUrl(sourceUrl);
    });
    if(!localRefs.length){
        toast('当前输入图片或视频已是云端链接');
        return [];
    }
    const btn = dynamicParams?.querySelector('[data-trusted-source="cloud"]') || inputThumbsRow?.querySelector('[data-temp-sh-upload-video]');
    if(btn) btn.disabled = true;
    toast(`正在上传 ${localRefs.length} 个媒体文件到云端...`);
    try {
        const urls = [];
        for(const ref of localRefs){
            urls.push(await uploadMediaRefToCloud(ref));
        }
        toast(`云端上传完成：${urls.length} 个媒体文件`);
        return urls;
    } finally {
        if(btn) btn.disabled = false;
    }
}
function setDynamicSetting(key, value){
    const numericKeys = new Set(['count','width','height','videoDuration','customRatioWidth','customRatioHeight','customWidth','customHeight','msCustomRatioWidth','msCustomRatioHeight','msCustomWidth','msCustomHeight']);
    const layoutKeys = new Set(['provider_id','model','resolution','ratio','msgenModel','msCustomModel','msResolution','msRatio','videoProvider','videoModel','videoAspect','videoResolution','quality','count']);
    settings[key] = numericKeys.has(key) && value !== '' ? Number(value) : value;
    if(key === 'provider_id') settings.model = '';
    if(key === 'videoProvider') settings.videoModel = '';
    if(key === 'videoMultimodal') settings._videoMultimodalUserSet = true;
    if(key === 'videoMultimodal' && settings.videoMultimodal) settings.videoUseFrameRoles = false;
    normalizeSmartVideoModeSettings(settings, key === 'videoUseFrameRoles');
    if(key === 'resolution'){
        if(settings.resolution === 'custom') settings.ratio = '';
        else if(!settings.ratio) settings.ratio = 'square';
    }
    if(key === 'ratio') applySourceRatioToSettings('');
    if(key === 'msResolution'){
        if(settings.msResolution === 'custom') settings.msRatio = '';
        else if(!settings.msRatio) settings.msRatio = 'square';
    }
    if(key === 'msRatio') applySourceRatioToSettings('ms');
    if(key === 'customRatioWidth' || key === 'customRatioHeight'){
        settings.customRatio = settings.customRatioWidth && settings.customRatioHeight ? `${settings.customRatioWidth}:${settings.customRatioHeight}` : '';
        settings.ratio = 'custom';
    }
    if(key === 'msCustomRatioWidth' || key === 'msCustomRatioHeight'){
        settings.msCustomRatio = settings.msCustomRatioWidth && settings.msCustomRatioHeight ? `${settings.msCustomRatioWidth}:${settings.msCustomRatioHeight}` : '';
        settings.msRatio = 'custom';
    }
    if(key === 'customWidth' || key === 'customHeight'){
        settings.customSize = settings.customWidth && settings.customHeight ? `${settings.customWidth}x${settings.customHeight}` : '';
        settings.resolution = 'custom';
    }
    if(key === 'msCustomWidth' || key === 'msCustomHeight'){
        settings.msCustomSize = settings.msCustomWidth && settings.msCustomHeight ? `${settings.msCustomWidth}x${settings.msCustomHeight}` : '';
        settings.msResolution = 'custom';
    }
    const sizeKeys = new Set(['resolution','ratio','customRatio','customRatioWidth','customRatioHeight','customWidth','customHeight','customSize']);
    const unlockOutpaintSize = settings.outpaintResolutionLocked && sizeKeys.has(key);
    if(unlockOutpaintSize){
        delete settings.outpaintResolutionLocked;
        const subject = activeSettingsSubject();
        if(subject) delete subject.outpaintSize;
    }
    persistActiveSmartSettings();
    rememberRecentSmartSettings(settings, activeSettingsSubject());
    if(layoutKeys.has(key)) renderDynamicParams();
    scheduleSave();
}
function closeAllSmartPopovers(){
    document.querySelectorAll('.smart-control.pinned, .smart-control.interacting').forEach(c => c.classList.remove('pinned', 'interacting'));
}
function markControlInteracting(el){
    const ctrl = el?.closest?.('.smart-control');
    if(ctrl && !ctrl.classList.contains('pinned')) ctrl.classList.add('interacting');
}
function bindDynamicParams(){
    dynamicParams.querySelectorAll('.smart-control').forEach(ctrl => {
        ctrl.onmouseleave = () => ctrl.classList.remove('interacting');
    });
    dynamicParams.querySelectorAll('.smart-control > .smart-pill').forEach(pill => {
        pill.onclick = event => {
            event.preventDefault();
            event.stopPropagation();
            const ctrl = pill.parentElement;
            const wasPinned = ctrl.classList.contains('pinned');
            closeAllSmartPopovers();
            if(!wasPinned) ctrl.classList.add('pinned');
        };
    });
    dynamicParams.querySelectorAll('[data-smart-param]').forEach(btn => {
        btn.onclick = event => {
            event.preventDefault();
            event.stopPropagation();
            markControlInteracting(btn);
            setDynamicSetting(btn.dataset.smartParam, btn.dataset.smartValue);
            if(btn.dataset.smartParam === 'videoDuration') renderDynamicParams();
        };
    });
    dynamicParams.querySelectorAll('[data-size-scope]').forEach(btn => {
        btn.onclick = event => {
            event.preventDefault();
            event.stopPropagation();
            markControlInteracting(btn);
            const prefix = btn.dataset.sizePrefix || '';
            const scope = btn.dataset.sizeScope;
            const resKey = prefix ? `${prefix}Resolution` : 'resolution';
            const ratioKey = prefix ? `${prefix}Ratio` : 'ratio';
            const allowAuto = !prefix && settings.engine === 'api' && settings.apiKind !== 'video' && isGptImageAutoSizeModel(settings.model);
            if(scope === 'auto'){
                if(!allowAuto) return;
                settings[resKey] = 'auto';
                if(!settings[ratioKey]) settings[ratioKey] = 'square';
            } else if(scope === 'custom'){
                settings[resKey] = 'custom';
            } else {
                settings[resKey] = ['1k','2k','4k'].includes(settings[resKey]) ? settings[resKey] : sizePickerDefaultResolution(prefix);
                if(!settings[ratioKey] || settings[ratioKey] === 'custom') settings[ratioKey] = 'square';
            }
            persistActiveSmartSettings();
            rememberRecentSmartSettings(settings, activeSettingsSubject());
            renderDynamicParams();
            scheduleSave();
        };
    });
    dynamicParams.querySelectorAll('[data-param]').forEach(input => {
        input.onclick = event => event.stopPropagation();
        input.oninput = input.onchange = event => {
            event?.stopPropagation?.();
            setDynamicSetting(input.dataset.param, input.value);
            if(input.dataset.param === 'videoDuration' && event?.type === 'change') renderDynamicParams();
        };
    });
    dynamicParams.querySelectorAll('[data-toggle-param]').forEach(btn => {
        btn.onclick = event => {
            event.preventDefault();
            event.stopPropagation();
            settings[btn.dataset.toggleParam] = !settings[btn.dataset.toggleParam];
            if(btn.dataset.toggleParam === 'videoMultimodal') settings._videoMultimodalUserSet = true;
            if(btn.dataset.toggleParam === 'videoMultimodal' && settings.videoMultimodal) settings.videoUseFrameRoles = false;
            normalizeSmartVideoModeSettings(settings, btn.dataset.toggleParam === 'videoUseFrameRoles');
            persistActiveSmartSettings();
            renderDynamicParams();
            scheduleSave();
        };
    });
    dynamicParams.querySelectorAll('[data-trusted-source]').forEach(btn => {
        btn.onclick = async event => {
            event.preventDefault();
            event.stopPropagation();
            const src = btn.dataset.trustedSource;
            settings.videoTrustedSource = ['library','cloud','manual'].includes(src) ? src : 'library';
            persistActiveSmartSettings();
            renderDynamicParams();
            scheduleSave();
            try {
                if(src === 'cloud') await uploadCurrentSmartVideosToCloud();
                else if(src === 'manual') await setCurrentSmartManualVideoUrl();
            } catch(e) {
                toast((e.message || '操作失败').slice(0, 180));
            }
        };
    });
}
async function loadConfig(){
    try {
        const cfg = await fetch('/api/config').then(r => r.json());
        apiProviders = Array.isArray(cfg.api_providers) ? cfg.api_providers : [];
        sanitizeSmartApiSelection(settings);
        lastConfigRefreshAt = Date.now();
        updateProviderModels();
    } catch(e) {
        toast(tr('smart.toastApiSettingsFail'));
    }
}
async function refreshSmartConfigFromSettings(){
    await loadConfig();
    renderDynamicParams();
    const node = selectedNode();
    if(node?.type === 'smart-prompt') {
        applySettingsToNode(node);
        render();
    }
}
function loadPromptPresets(){
    try {
        const list = JSON.parse(localStorage.getItem(PROMPT_PRESETS_KEY) || '[]');
        promptPresets = Array.isArray(list) ? list.filter(p => p?.id && typeof p.text === 'string') : [];
    } catch(e) {
        promptPresets = [];
    }
}
function savePromptPresets(){
    localStorage.setItem(PROMPT_PRESETS_KEY, JSON.stringify(promptPresets));
}
function defaultPromptTemplateGroups(){
    return [
        {id:'view', name:tr('smart.tplCatView')},
        {id:'storyboard', name:tr('smart.tplCatStoryboard')},
        {id:'character', name:tr('smart.tplCatCharacter')},
        {id:'product', name:tr('smart.tplCatProduct')},
        {id:'lighting', name:tr('smart.tplCatLighting')},
        {id:'mine', name:tr('smart.tplCatMine')}
    ];
}
function loadPromptTemplateGroups(){
    try {
        const list = JSON.parse(localStorage.getItem(PROMPT_TEMPLATE_GROUPS_KEY) || '[]');
        const valid = Array.isArray(list) ? list.filter(g => g?.id && g?.name) : [];
        const defaults = defaultPromptTemplateGroups();
        promptTemplateGroups = defaults.map(group => valid.find(g => g.id === group.id) || group);
        valid.filter(g => !promptTemplateGroups.some(x => x.id === g.id)).forEach(g => promptTemplateGroups.push(g));
    } catch(e) {
        promptTemplateGroups = defaultPromptTemplateGroups();
    }
}
function savePromptTemplateGroups(){
    localStorage.setItem(PROMPT_TEMPLATE_GROUPS_KEY, JSON.stringify(promptTemplateGroups));
}
function loadPromptTemplateOverrides(){
    try {
        const data = JSON.parse(localStorage.getItem(PROMPT_TEMPLATE_OVERRIDES_KEY) || '{}');
        promptTemplateOverrides = {
            hiddenBuiltinIds:Array.isArray(data.hiddenBuiltinIds) ? data.hiddenBuiltinIds : [],
            editedBuiltins:data.editedBuiltins && typeof data.editedBuiltins === 'object' ? data.editedBuiltins : {}
        };
    } catch(e) {
        promptTemplateOverrides = {hiddenBuiltinIds:[], editedBuiltins:{}};
    }
}
function savePromptTemplateOverrides(){
    localStorage.setItem(PROMPT_TEMPLATE_OVERRIDES_KEY, JSON.stringify(promptTemplateOverrides));
}
async function loadPromptTemplates(){
    try {
        const styleQuery = activePromptLibraryId === STYLE_PROMPT_LIBRARY_ID ? String(promptTemplateSearch?.value || '').trim() : '';
        const url = styleQuery ? `/api/prompt-libraries?style_query=${encodeURIComponent(styleQuery)}` : '/api/prompt-libraries';
        const data = await fetch(url).then(r => r.ok ? r.json() : {library:{libraries:[]}});
        promptLibraries = Array.isArray(data.library?.libraries) ? data.library.libraries : [];
        if(!promptLibraries.length) {
            const fallback = await fetch('/api/smart-canvas/prompt-templates').then(r => r.ok ? r.json() : {templates:[]});
            builtinPromptTemplates = Array.isArray(fallback.templates) ? fallback.templates.filter(t => t?.id && t?.positive) : [];
            promptLibraries = [{id:'system', name:'系统提示词库', readonly:true, items:builtinPromptTemplates}];
        } else {
            const system = promptLibraries.find(lib => lib.id === 'system') || promptLibraries[0];
            builtinPromptTemplates = Array.isArray(system?.items) ? system.items.filter(t => t?.id && t?.positive) : [];
        }
        if(!promptLibraries.some(lib => lib.id === activePromptLibraryId)) activePromptLibraryId = promptLibraries[0]?.id || 'system';
        renderPromptLibrarySelect();
    } catch(e) {
        builtinPromptTemplates = [];
        promptLibraries = [];
    }
}
function activePromptLibrary(){
    return promptLibraries.find(lib => lib.id === activePromptLibraryId) || promptLibraries[0] || {id:'system', name:'系统提示词库', readonly:true, items:builtinPromptTemplates};
}
function renderPromptLibrarySelect(){
    if(!promptTemplateLibrarySelect) return;
    promptTemplateLibrarySelect.innerHTML = promptLibraries.map(lib => `<option value="${escapeAttr(lib.id)}" ${lib.id === activePromptLibraryId ? 'selected' : ''}>${escapeHtml(lib.name || '提示词库')}</option>`).join('');
}
function promptTemplateItems(){
    const activeLibrary = activePromptLibrary();
    if(activeLibrary.id !== 'system'){
        return (activeLibrary.items || []).filter(t => t?.id && t?.positive).map(t => ({
            ...t,
            sourceId:t.id,
            builtin:Boolean(activeLibrary.readonly),
            remote:true,
            libraryId:activeLibrary.id
        }));
    }
    // 系统库的条目同样走后端（/api/prompt-libraries），与素材库管理共用一套数据。
    // 这样画布里修改/删除系统提示词会实时同步，不再依赖各端不互通的 localStorage 覆盖。
    // 仍保留 builtin:true 用于“内置”标签与完整提示词（含负向/参数）的展示。
    const source = Array.isArray(activeLibrary.items) && activeLibrary.items.length ? activeLibrary.items : builtinPromptTemplates;
    const builtins = source
        .filter(t => t?.id && t?.positive)
        .map(t => ({...t, sourceId:t.id, builtin:true, remote:true, libraryId:'system'}));
    const mine = promptPresets.map(p => ({
        id:`mine:${p.id}`,
        sourceId:p.id,
        name:p.name || tr('smart.promptPresetUnnamed'),
        // 系统库分组以后端为准（custom=“我的”），本地旧预设归到 custom 分组下展示，避免无对应标签。
        category:(p.category && p.category !== 'mine') ? p.category : 'custom',
        scene:'我的提示词预设',
        positive:p.text || '',
        negative:'',
        params:{},
        builtin:false
    }));
    return [...builtins, ...mine];
}
function promptTemplateText(template, mode='positive'){
    const positive = String(template?.positive || '').trim();
    if(mode === 'positive' || !template?.builtin) return positive;
    const negative = String(template?.negative || '').trim();
    const params = Object.entries(template?.params || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    return [positive, negative ? `Negative prompt:\n${negative}` : '', params ? `Params:\n${params}` : ''].filter(Boolean).join('\n\n');
}
function promptTemplateName(template){
    if(window.StudioI18n?.lang?.() === 'en' && template?.name_en) return template.name_en;
    return template?.name || '';
}
function promptTemplateScene(template){
    if(window.StudioI18n?.lang?.() === 'en' && template?.scene_en) return template.scene_en;
    return template?.scene || '';
}
function promptTemplateSearchText(template){
    return [
        template?.name,
        template?.name_en,
        template?.scene,
        template?.scene_en,
        template?.positive,
        template?.negative
    ].join(' ').toLowerCase();
}
function activePromptTemplateGroups(){
    const lib = activePromptLibrary();
    // 系统库的分组也以后端 categories 为准，与素材库管理共用同一份分组数据（可重命名/删除并同步）。
    const fromLib = Array.isArray(lib?.categories) ? lib.categories.filter(c => c?.id && c?.name) : [];
    if(fromLib.length) return fromLib;
    if(!lib || lib.id === 'system') return promptTemplateGroups;
    return [];
}
function promptTemplateCategoryLabel(category){
    if(category === 'all') return tr('smart.tplAll');
    // 分组名优先以后端 categories 为准（含内置分组重命名），保证两端显示一致。
    const fromGroups = activePromptTemplateGroups().find(g => g.id === category)?.name;
    if(fromGroups) return fromGroups;
    const builtin = {
        view:tr('smart.tplCatView'),
        storyboard:tr('smart.tplCatStoryboard'),
        character:tr('smart.tplCatCharacter'),
        product:tr('smart.tplCatProduct'),
        lighting:tr('smart.tplCatLighting'),
        custom:tr('smart.tplCatMine'),
        mine:tr('smart.tplCatMine')
    };
    return builtin[category] || promptTemplateGroups.find(g => g.id === category)?.name || category;
}
function promptTemplateSelectedItem(){
    return promptTemplateItems().find(item => item.id === promptTemplateSelectedId) || promptTemplateItems()[0] || null;
}
function currentPromptPreset(id){
    return promptPresets.find(p => p.id === id) || null;
}
function defaultPromptPresetName(text){
    return (String(text || '').trim().split(/\r?\n/)[0] || tr('smart.promptPresetDefault')).slice(0, 28);
}
function promptPresetPanelNode(){
    return nodes.find(n => n.id === promptPresetPanel?.dataset.nodeId) || null;
}
function setPromptPresetStatus(text='', tone=''){
    if(!promptPresetStatus) return;
    promptPresetStatus.textContent = text;
    promptPresetStatus.classList.toggle('warn', tone === 'warn');
    promptPresetStatus.classList.toggle('ok', tone === 'ok');
}
function resetPromptPresetDeleteState(){
    promptPresetDeleteArmed = false;
    if(promptPresetDelete){
        promptPresetDelete.textContent = tr('common.delete');
        promptPresetDelete.classList.remove('confirm-danger');
    }
}
function createPromptPresetFromNode(node, {openPanel=true, openTemplatePanel=false}={}){
    const text = String(node?.text || '').trim();
    if(!text){ toast(tr('smart.promptPresetEmpty')); return null; }
    const preset = {id:uid('preset'), name:defaultPromptPresetName(text), text, createdAt:Date.now(), updatedAt:Date.now()};
    promptPresets.unshift(preset);
    savePromptPresets();
    if(node) node.promptPresetId = preset.id;
    render();
    scheduleSave();
    if(openPanel) openPromptPresetPanel(node?.id || '', preset.id, {status:tr('smart.promptPresetSavedNew'), tone:'ok'});
    if(openTemplatePanel) {
        promptTemplateCategory = 'mine';
        promptTemplateSelectedId = `mine:${preset.id}`;
        promptTemplateEditing = true;
        openPromptTemplatePanel(node?.id || '', promptTemplateSelectedId);
    }
    return preset;
}
function createPromptPresetFromComposer(){
    const text = promptPlainText();
    if(!text){ toast(tr('smart.promptPresetEmpty')); return null; }
    const preset = {id:uid('preset'), name:defaultPromptPresetName(text), text, category:'mine', createdAt:Date.now(), updatedAt:Date.now()};
    promptPresets.unshift(preset);
    savePromptPresets();
    savePromptDraftForCurrent();
    scheduleSave();
    return preset;
}
function savePromptNodeAsPreset(node){
    createPromptPresetFromNode(node);
}
function renderPromptPresetPanel(selectedId='', message=''){
    if(!promptPresetSelect) return;
    resetPromptPresetDeleteState();
    promptPresetSelect.innerHTML = promptPresets.length
        ? promptPresets.map(p => `<option value="${escapeHtml(p.id)}" ${p.id === selectedId ? 'selected' : ''}>${escapeHtml(p.name || tr('smart.promptPresetUnnamed'))}</option>`).join('')
        : `<option value="">${escapeHtml(tr('smart.promptPresetNone'))}</option>`;
    const preset = currentPromptPreset(selectedId) || promptPresets[0] || null;
    if(preset && promptPresetSelect.value !== preset.id) promptPresetSelect.value = preset.id;
    promptPresetName.value = preset?.name || '';
    promptPresetText.value = preset?.text || '';
    const hasPreset = Boolean(preset);
    const nodeHasText = Boolean(String(promptPresetPanelNode()?.text || '').trim());
    promptPresetApply.disabled = !hasPreset;
    promptPresetDelete.disabled = !hasPreset;
    promptPresetSave.disabled = !hasPreset;
    if(promptPresetNew) promptPresetNew.disabled = !nodeHasText;
    setPromptPresetStatus(message || (hasPreset ? tr('smart.promptPresetPanelHint') : tr('smart.promptPresetPanelEmpty')));
}
function openPromptPresetPanel(nodeId='', presetId='', options={}){
    if(!promptPresetPanel) return;
    promptPresetPanel.dataset.nodeId = nodeId || '';
    const node = nodes.find(n => n.id === nodeId);
    const preferred = presetId || node?.promptPresetId || promptPresets[0]?.id || '';
    renderPromptPresetPanel(preferred, options.status || '');
    if(options.tone) setPromptPresetStatus(options.status || '', options.tone);
    const nodeEl = nodeId ? world.querySelector(`.image-node[data-id="${CSS.escape(nodeId)}"]`) : null;
    const rect = nodeEl?.getBoundingClientRect();
    const shellRect = shell.getBoundingClientRect();
    const maxLeft = Math.max(18, shellRect.width - 410);
    const maxTop = Math.max(18, shellRect.height - 330);
    const left = rect ? Math.min(maxLeft, Math.max(18, rect.right - shellRect.left + 12)) : 80;
    const top = rect ? Math.min(maxTop, Math.max(18, rect.top - shellRect.top)) : 80;
    promptPresetPanel.style.left = `${left}px`;
    promptPresetPanel.style.top = `${top}px`;
    promptPresetPanel.classList.add('open');
    refreshIcons();
}
function closePromptPresetPanel(){
    promptPresetPanel?.classList.remove('open');
    resetPromptPresetDeleteState();
}
function promptTemplateScrollSnapshot(){
    if(!promptTemplatePanel) return null;
    return {
        panelTop:promptTemplatePanel.scrollTop || 0,
        tabLeft:promptTemplatePanel.querySelector('.prompt-template-tabs')?.scrollLeft || 0,
        listTop:promptTemplatePanel.querySelector('.prompt-template-list')?.scrollTop || 0,
        detailTop:promptTemplatePanel.querySelector('.prompt-template-preview-content')?.scrollTop || 0
    };
}
function restorePromptTemplateScroll(snapshot){
    if(!snapshot || !promptTemplatePanel) return;
    requestAnimationFrame(() => {
        promptTemplatePanel.scrollTop = snapshot.panelTop || 0;
        const tabs = promptTemplatePanel.querySelector('.prompt-template-tabs');
        const list = promptTemplatePanel.querySelector('.prompt-template-list');
        const detail = promptTemplatePanel.querySelector('.prompt-template-preview-content');
        if(tabs) tabs.scrollLeft = snapshot.tabLeft || 0;
        if(list) list.scrollTop = snapshot.listTop || 0;
        if(detail) detail.scrollTop = snapshot.detailTop || 0;
    });
}
function renderPromptTemplatePanel(options={}){
    if(!promptTemplatePanel || !promptTemplateBody || !promptTemplateCats) return;
    renderPromptLibrarySelect();
    const scrollSnapshot = options.preserveScroll === false ? null : promptTemplateScrollSnapshot();
    const query = String(promptTemplateSearch?.value || '').trim().toLowerCase();
    const activeLibrary = activePromptLibrary();
    const dynamicSearchLibrary = Boolean(activeLibrary?.dynamic);
    const allTemplates = promptTemplateItems();
    const activeGroups = activePromptTemplateGroups();
    // 防御：若当前分类筛选不属于当前词库（例如刚切换词库或分类已被删除），回到“全部”，避免列表被过滤为空。
    if(promptTemplateCategory !== 'all' && !activeGroups.some(g => g.id === promptTemplateCategory)) promptTemplateCategory = 'all';
    const categories = [{id:'all', name:tr('smart.tplAll')}, ...activeGroups.map(group => ({...group, name:promptTemplateCategoryLabel(group.id)}))];
    const groupCounts = allTemplates.reduce((map, item) => {
        map[item.category || 'mine'] = (map[item.category || 'mine'] || 0) + 1;
        return map;
    }, {all:allTemplates.length});
    promptTemplateCats.innerHTML = promptTemplateGroupEditMode ? `
        <div class="prompt-template-group-panel">
            <div class="prompt-template-group-title">
                <div>
                    <strong>${escapeHtml(tr('smart.tplGroupManage'))}</strong>
                    <span>${escapeHtml(tr('smart.tplGroupHint'))}</span>
                </div>
                <div class="prompt-template-group-tools">
                    <button type="button" data-template-cat-new><i data-lucide="plus"></i><span>${escapeHtml(tr('smart.tplAdd'))}</span></button>
                    <button type="button" class="primary" data-template-group-edit><i data-lucide="check"></i><span>${escapeHtml(tr('smart.tplDone'))}</span></button>
                </div>
            </div>
            <div class="prompt-template-group-list">
                ${activeGroups.map(group => `
                    <div class="prompt-template-group-row has-delete">
                        <button type="button" class="group-name ${group.id === promptTemplateCategory ? 'active' : ''}" data-template-cat="${escapeHtml(group.id)}">
                            <span>${escapeHtml(promptTemplateCategoryLabel(group.id))}</span>
                            <small>${groupCounts[group.id] || 0}</small>
                        </button>
                        <button type="button" class="group-tool" data-template-cat-edit="${escapeHtml(group.id)}" title="${escapeAttr(tr('smart.tplRename'))}"><i data-lucide="pencil"></i></button>
                        <button type="button" class="group-tool danger" data-template-cat-delete="${escapeHtml(group.id)}" title="${escapeAttr(tr('common.delete'))}"><i data-lucide="trash-2"></i></button>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : `
        <div class="prompt-template-nav">
            <div class="prompt-template-tabs">
                ${categories.map(cat => `
                    <button type="button" class="${cat.id === promptTemplateCategory ? 'active' : ''}" data-template-cat="${escapeHtml(cat.id)}">
                        <span>${escapeHtml(cat.name)}</span>
                        <small>${groupCounts[cat.id] || 0}</small>
                    </button>
                `).join('')}
            </div>
            <button type="button" class="prompt-template-manage-groups" data-template-group-edit><i data-lucide="settings-2"></i><span>${escapeHtml(tr('smart.tplManageGroups'))}</span></button>
        </div>
    `;
    const items = allTemplates.filter(item => {
        if(promptTemplateCategory !== 'all' && item.category !== promptTemplateCategory) return false;
        if(!query || dynamicSearchLibrary) return true;
        return promptTemplateSearchText(item).includes(query);
    });
    if(items.length && !items.some(item => item.id === promptTemplateSelectedId)) promptTemplateSelectedId = items[0].id;
    const selected = items.find(item => item.id === promptTemplateSelectedId) || items[0] || null;
    const selectedPreset = selected?.builtin || selected?.remote
        ? {id:selected.id, name:selected.name || '', text:selected.positive || '', category:selected.category || 'storyboard', builtin:Boolean(selected.builtin)}
        : (selected ? currentPromptPreset(selected.sourceId) : null);
    const target = promptTemplatePanel.dataset.target || 'node';
    const node = nodes.find(n => n.id === promptTemplatePanel.dataset.nodeId);
    // 系统库 readonly=false，其条目也可编辑/删除（经后端持久化），因此只看 readonly。
    const canEditCurrentLibrary = !activeLibrary.readonly;
    const editMode = Boolean(promptTemplateEditing && selectedPreset);
    promptTemplateBody.innerHTML = `
        <div class="prompt-template-list">
            <div class="prompt-template-list-tools">
                <button type="button" data-template-save-current><i data-lucide="bookmark-plus"></i><span>${escapeHtml(tr('smart.tplSaveCurrent'))}</span></button>
                <button type="button" data-template-new><i data-lucide="file-plus-2"></i><span>${escapeHtml(tr('smart.tplNewTemplate'))}</span></button>
            </div>
            ${items.length ? items.map(item => `<button type="button" class="prompt-template-card ${item.id === selected?.id ? 'active' : ''}" data-template-id="${escapeHtml(item.id)}">
                <span class="prompt-template-card-top">
                    <span class="prompt-template-name">${escapeHtml(promptTemplateName(item))}</span>
                    <span class="prompt-template-source">${escapeHtml(item.builtin ? tr('smart.tplBuiltin') : tr('smart.tplMine'))}</span>
                </span>
                <span class="prompt-template-scene">${escapeHtml(promptTemplateScene(item) || item.positive || '')}</span>
                <span class="prompt-template-tag">${escapeHtml(promptTemplateCategoryLabel(item.category || 'mine'))}</span>
            </button>`).join('') : `<div class="prompt-template-list-empty">${escapeHtml(tr('smart.tplNoMatches'))}</div>`}
        </div>
        <div class="prompt-template-detail">
            ${selected ? `
                <div class="prompt-template-detail-head">
                    <div>
                        <strong>${escapeHtml(promptTemplateName(selected) || '')}</strong>
                        <span>${escapeHtml(promptTemplateCategoryLabel(selected.category || ''))} · ${escapeHtml(selected.builtin ? tr('smart.tplBuiltinTemplate') : tr('smart.tplMineTemplate'))}</span>
                    </div>
                    ${editMode ? '' : `
                        <div class="prompt-template-icon-actions">
                            <button type="button" ${!canEditCurrentLibrary ? 'disabled' : ''} data-template-edit title="${escapeAttr(tr('smart.tplEditTemplate'))}"><i data-lucide="pencil"></i><span>${escapeHtml(tr('common.edit'))}</span></button>
                            <button type="button" ${!canEditCurrentLibrary ? 'disabled' : ''} class="danger" data-template-delete title="${escapeAttr(tr('smart.tplDeleteTemplate'))}"><i data-lucide="trash-2"></i><span>${escapeHtml(tr('common.delete'))}</span></button>
                        </div>
                    `}
                </div>
            ${editMode ? `
                <div class="prompt-template-edit-fields">
                    <label>${escapeHtml(tr('smart.tplName'))}</label>
                    <input data-template-edit-name value="${escapeAttr(selectedPreset.name || '')}" placeholder="${escapeAttr(tr('smart.tplName'))}">
                    <label>${escapeHtml(tr('smart.tplGroup'))}</label>
                    <select data-template-edit-category>
                        ${activeGroups.map(group => `<option value="${escapeAttr(group.id)}" ${group.id === (selectedPreset.category || selected?.category || 'mine') ? 'selected' : ''}>${escapeHtml(promptTemplateCategoryLabel(group.id))}</option>`).join('')}
                    </select>
                    <label>${escapeHtml(tr('smart.tplContent'))}</label>
                    <textarea data-template-edit-text placeholder="${escapeAttr(tr('smart.tplContent'))}">${escapeHtml(selectedPreset.text || '')}</textarea>
                </div>
            ` : `
                <div class="prompt-template-preview-content">
                <div class="prompt-template-section">
                    <label>${escapeHtml(tr('smart.tplPositive'))}</label>
                    <p>${escapeHtml(selected?.positive || '')}</p>
                </div>
                ${selected?.negative ? `<div class="prompt-template-section">
                    <label>${escapeHtml(tr('smart.tplNegative'))}</label>
                    <p>${escapeHtml(selected.negative)}</p>
                </div>` : ''}
                ${Object.keys(selected?.params || {}).length ? `<div class="prompt-template-section">
                    <label>${escapeHtml(tr('smart.tplParams'))}</label>
                    <p>${escapeHtml(Object.entries(selected.params).map(([k,v]) => `${k}: ${v}`).join('\n'))}</p>
                </div>` : ''}
                </div>
            `}
            <div class="prompt-template-actions">
                ${editMode ? `
                    <button type="button" data-template-edit-cancel><i data-lucide="x"></i><span>${escapeHtml(tr('common.cancel'))}</span></button>
                    <button type="button" class="danger" data-template-delete><i data-lucide="trash-2"></i><span>${escapeHtml(tr('common.delete'))}</span></button>
                    <button type="button" class="primary" data-template-edit-save><i data-lucide="save"></i><span>${escapeHtml(tr('common.save'))}</span></button>
                ` : `
                    <button type="button" data-template-apply="positive"><i data-lucide="corner-down-left"></i><span>${escapeHtml(tr('smart.tplApplyPositive'))}</span></button>
                    <button type="button" class="primary" data-template-apply="full"><i data-lucide="wand-sparkles"></i><span>${escapeHtml(tr('smart.tplApplyFull'))}</span></button>
                `}
            </div>
            ` : `<div class="prompt-template-empty">${escapeHtml(tr('smart.tplPickOrCreate'))}</div>`}
        </div>
    `;
    refreshIcons();
    restorePromptTemplateScroll(scrollSnapshot);
}
function activePromptTemplateNodeId(){
    return promptTemplatePanel?.classList?.contains('open') && promptTemplatePanel.dataset.target !== 'composer' ? (promptTemplatePanel.dataset.nodeId || '') : '';
}
function syncComposerTemplateButton(){
    if(!composerTemplateBtn || !promptTemplatePanel) return;
    const active = promptTemplatePanel.classList.contains('open') && promptTemplatePanel.dataset.target === 'composer';
    composerTemplateBtn.classList.toggle('active', active);
    composerTemplateBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
}
async function openPromptTemplatePanel(nodeId='', templateId='', options={}){
    if(!promptTemplatePanel) return;
    const target = options.target === 'composer' ? 'composer' : 'node';
    promptTemplatePanel.dataset.target = target;
    promptTemplatePanel.dataset.nodeId = nodeId || '';
    if(promptTemplatePanel.parentElement !== shell) shell.appendChild(promptTemplatePanel);
    if(templateId) promptTemplateSelectedId = templateId;
    promptTemplatePanel.classList.add('open');
    // 每次打开都从后端拉取最新提示词库，确保素材库管理里的新增/修改/删除实时反映到画布（同根同源）。
    try { await loadPromptTemplates(); } catch(e){}
    if(!promptTemplateSelectedId || !promptTemplateItems().some(it => it.id === promptTemplateSelectedId)){
        promptTemplateSelectedId = promptTemplateItems()[0]?.id || '';
    }
    renderPromptTemplatePanel();
    if(target === 'node' && nodeId){
        selectedId = nodeId;
        selectedIds = [];
        selectedImage = {nodeId:'', index:-1};
    }
    render();
    syncComposerTemplateButton();
    promptTemplateSearch?.focus();
}
function closePromptTemplatePanel(){
    promptTemplatePanel?.classList.remove('open');
    syncComposerTemplateButton();
    render();
}
function handlePromptTemplateSearchInput(){
    if(!activePromptLibrary()?.dynamic){
        renderPromptTemplatePanel({preserveScroll:false});
        return;
    }
    window.clearTimeout(promptStyleSearchTimer);
    const token = ++promptStyleSearchToken;
    promptStyleSearchTimer = window.setTimeout(async () => {
        try { await loadPromptTemplates(); } catch(e) {}
        if(token !== promptStyleSearchToken) return;
        promptTemplateSelectedId = '';
        renderPromptTemplatePanel({preserveScroll:false});
    }, 260);
    renderPromptTemplatePanel({preserveScroll:false});
}
function applyPromptTemplateToNode(mode='positive'){
    const template = promptTemplateItems().find(item => item.id === promptTemplateSelectedId);
    if(!template) return;
    if(promptTemplatePanel?.dataset.target === 'composer'){
        const text = promptTemplateText(template, mode);
        setPromptText(text);
        delete promptInput.dataset.preserveDraftOnce;
        savePromptDraftForCurrent();
        renderInputThumbsRow(selectedNode());
        closePromptTemplatePanel();
        scheduleSave();
        return;
    }
    const node = nodes.find(n => n.id === promptTemplatePanel?.dataset.nodeId);
    if(!node) return;
    node.text = promptTemplateText(template, mode);
    node.promptPresetId = template.builtin ? '' : template.sourceId || '';
    closePromptTemplatePanel();
    render();
    scheduleSave();
}
async function saveCurrentPromptAsTemplate(){
    const library = activePromptLibrary();
    // 系统库 readonly=false，也允许新增条目（走后端，与素材库管理同步）。
    if(library.readonly){ toast('请选择可编辑的提示词库'); return; }
    const text = promptTemplatePanel?.dataset.target === 'composer'
        ? promptPlainText()
        : String(nodes.find(n => n.id === promptTemplatePanel?.dataset.nodeId)?.text || '').trim();
    if(!text){ toast(tr('smart.promptPresetEmpty')); return; }
    try {
        const data = await fetch('/api/prompt-libraries/items', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({library_id:library.id, name:defaultPromptPresetName(text), category:promptTemplateCategory === 'all' ? 'custom' : promptTemplateCategory, positive:text, scene:'我的提示词预设'})
        }).then(async r => {
            if(!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || '保存失败');
            return r.json();
        });
        promptLibraries = data.library?.libraries || promptLibraries;
        activePromptLibraryId = library.id;
        promptTemplateCategory = data.item?.category || 'custom';
        promptTemplateSelectedId = data.item?.id || '';
        promptTemplateEditing = true;
        renderPromptTemplatePanel({preserveScroll:false});
    } catch(err) {
        toast(err.message || '保存失败');
    }
}
async function createBlankPromptTemplate(){
    const library = activePromptLibrary();
    // 系统库 readonly=false，也允许新建空白条目（走后端，与素材库管理同步）。
    if(library.readonly){ toast('请选择可编辑的提示词库'); return; }
    const category = promptTemplateCategory && promptTemplateCategory !== 'all' ? promptTemplateCategory : 'custom';
    try {
        const data = await fetch('/api/prompt-libraries/items', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({library_id:library.id, name:tr('smart.tplNewTemplateName'), category, positive:'新提示词', scene:'我的提示词预设'})
        }).then(async r => {
            if(!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || '创建失败');
            return r.json();
        });
        promptLibraries = data.library?.libraries || promptLibraries;
        activePromptLibraryId = library.id;
        promptTemplateCategory = category;
        promptTemplateSelectedId = data.item?.id || '';
        promptTemplateEditing = true;
        renderPromptTemplatePanel({preserveScroll:false});
    } catch(err) {
        toast(err.message || '创建失败');
    }
}
async function savePromptTemplateEdit(){
    const item = promptTemplateSelectedItem();
    if(!item) return;
    const name = promptTemplatePanel.querySelector('[data-template-edit-name]')?.value?.trim() || '';
    const text = promptTemplatePanel.querySelector('[data-template-edit-text]')?.value?.trim() || '';
    const category = promptTemplatePanel.querySelector('[data-template-edit-category]')?.value || 'mine';
    if(!name || !text){ toast(tr('smart.tplRequired')); return; }
    if(item.remote){
        try {
            const data = await fetch(`/api/prompt-libraries/items/${encodeURIComponent(item.id)}`, {
                method:'PATCH',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({library_id:item.libraryId || activePromptLibrary().id, name, category, positive:text, scene:item.scene || '', negative:item.negative || ''})
            }).then(async r => {
                if(!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || '保存失败');
                return r.json();
            });
            promptLibraries = data.library?.libraries || promptLibraries;
            promptTemplateSelectedId = data.item?.id || item.id;
        } catch(err) {
            toast(err.message || '保存失败');
            return;
        }
    } else if(item.builtin){
        promptTemplateOverrides.editedBuiltins = promptTemplateOverrides.editedBuiltins || {};
        promptTemplateOverrides.editedBuiltins[item.id] = {
            ...(promptTemplateOverrides.editedBuiltins[item.id] || {}),
            name,
            positive:text,
            category
        };
        savePromptTemplateOverrides();
    } else {
        const preset = currentPromptPreset(item.sourceId);
        if(!preset) return;
        const idx = promptPresets.findIndex(p => p.id === preset.id);
        if(idx >= 0) promptPresets[idx] = {...promptPresets[idx], name, text, category, updatedAt:Date.now()};
        savePromptPresets();
        nodes.forEach(node => { if(node.promptPresetId === preset.id) node.text = text; });
    }
    promptTemplateEditing = false;
    renderPromptTemplatePanel();
    render();
    scheduleSave();
}
async function deletePromptTemplate(){
    const item = promptTemplateSelectedItem();
    if(!item) return;
    if(item.remote){
        try {
            const data = await fetch(`/api/prompt-libraries/items/${encodeURIComponent(item.id)}`, {method:'DELETE'}).then(async r => {
                if(!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || '删除失败');
                return r.json();
            });
            promptLibraries = data.library?.libraries || promptLibraries;
        } catch(err) {
            toast(err.message || '删除失败');
            return;
        }
    } else if(item.builtin){
        promptTemplateOverrides.hiddenBuiltinIds = [...new Set([...(promptTemplateOverrides.hiddenBuiltinIds || []), item.id])];
        savePromptTemplateOverrides();
    } else {
        promptPresets = promptPresets.filter(p => p.id !== item.sourceId);
        nodes.forEach(node => { if(node.promptPresetId === item.sourceId) node.promptPresetId = ''; });
        savePromptPresets();
    }
    promptTemplateSelectedId = '';
    promptTemplateEditing = false;
    renderPromptTemplatePanel({preserveScroll:false});
    render();
    scheduleSave();
}
async function createPromptTemplateGroup(){
    const name = window.prompt(tr('smart.tplNewGroupPrompt'), tr('smart.tplNewGroupDefault'));
    if(!String(name || '').trim()) return;
    const lib = activePromptLibrary();
    // 系统库（readonly=false）也走后端新增分组，与素材库管理同步。
    if(lib && !lib.readonly){
        try {
            const data = await fetch('/api/prompt-libraries/categories', {
                method:'POST', headers:{'Content-Type':'application/json'},
                body:JSON.stringify({name:String(name).trim().slice(0, 24), library_id:lib.id})
            }).then(async r => { if(!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || '新增分组失败'); return r.json(); });
            promptLibraries = data.library?.libraries || promptLibraries;
            promptTemplateCategory = data.category?.id || promptTemplateCategory;
            renderPromptTemplatePanel({preserveScroll:false});
        } catch(err){ if(typeof setStatus === 'function') setStatus(err.message || '新增分组失败'); }
        return;
    }
    const group = {id:uid('tpl_group'), name:String(name).trim().slice(0, 24)};
    promptTemplateGroups.push(group);
    savePromptTemplateGroups();
    promptTemplateCategory = group.id;
    renderPromptTemplatePanel({preserveScroll:false});
}
async function renamePromptTemplateGroup(groupId){
    const lib = activePromptLibrary();
    const group = activePromptTemplateGroups().find(g => g.id === groupId);
    if(!group) return;
    const name = window.prompt(tr('smart.tplGroupNamePrompt'), group.name || '');
    if(!String(name || '').trim()) return;
    // 系统库的内置分组也走后端重命名（后端已放开内置分组限制），两端同步。
    if(lib && !lib.readonly){
        try {
            const data = await fetch(`/api/prompt-libraries/categories/${encodeURIComponent(groupId)}`, {
                method:'PATCH', headers:{'Content-Type':'application/json'},
                body:JSON.stringify({name:String(name).trim().slice(0, 24), library_id:lib.id})
            }).then(async r => { if(!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || '重命名失败'); return r.json(); });
            promptLibraries = data.library?.libraries || promptLibraries;
            renderPromptTemplatePanel();
        } catch(err){ if(typeof setStatus === 'function') setStatus(err.message || '重命名失败'); }
        return;
    }
    group.name = String(name).trim().slice(0, 24);
    savePromptTemplateGroups();
    renderPromptTemplatePanel();
}
async function deletePromptTemplateGroup(groupId){
    const lib = activePromptLibrary();
    // 系统库的内置分组也走后端删除（后端已放开限制并把孤立条目改挂到剩余分组），两端同步。
    if(lib && !lib.readonly){
        if(!window.confirm(tr('smart.tplDeleteGroupConfirm'))) return;
        try {
            const data = await fetch(`/api/prompt-libraries/categories/${encodeURIComponent(groupId)}`, {method:'DELETE'})
                .then(async r => { if(!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || '删除失败'); return r.json(); });
            promptLibraries = data.library?.libraries || promptLibraries;
            if(promptTemplateCategory === groupId) promptTemplateCategory = 'all';
            renderPromptTemplatePanel({preserveScroll:false});
        } catch(err){ if(typeof setStatus === 'function') setStatus(err.message || '删除失败'); }
        return;
    }
    if(!window.confirm(tr('smart.tplDeleteGroupConfirm'))) return;
    promptTemplateGroups = promptTemplateGroups.filter(g => g.id !== groupId);
    promptPresets = promptPresets.map(p => p.category === groupId ? {...p, category:'mine'} : p);
    Object.entries(promptTemplateOverrides.editedBuiltins || {}).forEach(([id, item]) => {
        if(item?.category === groupId) promptTemplateOverrides.editedBuiltins[id] = {...item, category:'mine'};
    });
    if(promptTemplateCategory === groupId) promptTemplateCategory = 'all';
    savePromptTemplateGroups();
    savePromptPresets();
    savePromptTemplateOverrides();
    renderPromptTemplatePanel({preserveScroll:false});
}
function editPromptPresetForNode(node){
    openPromptTemplatePanel(node?.id || '', node?.promptPresetId ? `mine:${node.promptPresetId}` : '');
}
function assetCategories(type='image'){
    const library = activeAssetLibrary();
    return (library?.categories || assetLibrary.categories || []).filter(cat => (cat.type || 'image') === type);
}
function assetSmartClassKey(entry){
    if(!entry?.dimension || !entry?.tag) return '';
    return `${String(entry.dimension)}::${String(entry.tag)}`;
}
function assetSmartClassOptionId(entry){
    const key = assetSmartClassKey(entry);
    return key ? `${ASSET_SMART_CATEGORY_PREFIX}${key}` : '';
}
function parseAssetSmartClassId(id=''){
    const value = String(id || '');
    if(!value.startsWith(ASSET_SMART_CATEGORY_PREFIX)) return null;
    const raw = value.slice(ASSET_SMART_CATEGORY_PREFIX.length);
    const index = raw.indexOf('::');
    if(index < 0) return null;
    return {dimension:raw.slice(0, index), tag:raw.slice(index + 2)};
}
function assetSmartClassEntries(){
    const groups = new Map();
    assetCategories('image').forEach(cat => {
        (cat.items || []).forEach(item => {
            const flat = Array.isArray(item?.classification?.flat) ? item.classification.flat : [];
            flat.forEach(entry => {
                const key = assetSmartClassKey(entry);
                if(!key) return;
                const prev = groups.get(key) || {
                    id:assetSmartClassOptionId(entry),
                    dimension:String(entry.dimension || ''),
                    label:String(entry.label || entry.dimension || '分类'),
                    tag:String(entry.tag || ''),
                    count:0
                };
                prev.count += 1;
                groups.set(key, prev);
            });
        });
    });
    return [...groups.values()].sort((a, b) => {
        if(a.label !== b.label) return a.label.localeCompare(b.label, 'zh-CN');
        return b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN');
    });
}
function itemsForAssetSmartClass(optionId=''){
    const parsed = parseAssetSmartClassId(optionId);
    if(!parsed) return [];
    return assetCategories('image').flatMap(cat => cat.items || []).filter(item => {
        const flat = Array.isArray(item?.classification?.flat) ? item.classification.flat : [];
        return flat.some(entry => String(entry.dimension || '') === parsed.dimension && String(entry.tag || '') === parsed.tag);
    });
}
function assetLibraries(){
    return Array.isArray(assetLibrary.libraries) && assetLibrary.libraries.length ? assetLibrary.libraries : [{id:'default', name:'Default Assets', categories:assetLibrary.categories || []}];
}
function localAssetFolderCategories(){
    const result = [];
    const walk = node => {
        if(!node) return;
        const isRoot = (node.id || node.path || '__root__') === '__root__';
        result.push({
            id: node.id || (node.path ? node.path : '__root__'),
            name: node.name || (node.path ? node.path.split('/').pop() : 'All Uploads'),
            type: 'image',
            items: (isRoot ? (localAssetLibrary.items || []) : (node.items || [])).filter(item => assetMediaKind(item) === 'image'),
            readonly: true,
            source: 'local',
        });
        (node.children || []).forEach(walk);
    };
    walk(localAssetLibrary.tree || {id:'__root__', name:'All Uploads', items:localAssetLibrary.items || [], children:[]});
    return result;
}
function assetLibraryIsLocal(){
    return activeAssetLibraryId === LOCAL_ASSET_LIBRARY_ID;
}
function currentAssetSourceLibraries(){
    return [
        ...assetLibraries(),
        {id:LOCAL_ASSET_LIBRARY_ID, name:'Local Assets', categories:localAssetFolderCategories(), readonly:true, source:'local'}
    ];
}
function activeAssetLibrary(){
    if(assetLibraryIsLocal()) return currentAssetSourceLibraries().find(lib => lib.id === LOCAL_ASSET_LIBRARY_ID);
    const libs = assetLibraries();
    return libs.find(lib => lib.id === activeAssetLibraryId) || libs[0] || null;
}
function activeAssetCategory(){
    const cats = assetCategories('image');
    if(parseAssetSmartClassId(activeAssetCategoryId)) return null;
    if(!cats.length) return null;
    return cats.find(cat => cat.id === activeAssetCategoryId) || cats[0];
}
function currentAssetTabCategories(){
    return assetCategories('image');
}
function activeAssetTabCategory(){
    return activeAssetCategory();
}
function setActiveAssetTabCategory(categoryId=''){
    activeAssetCategoryId = categoryId || '';
}
async function loadAssetLibrary(){
    try {
        const [data, localData] = await Promise.all([
            fetch('/api/asset-library').then(r => r.json()),
            fetch('/api/local-assets').then(r => r.ok ? r.json() : {items:[], tree:null}).catch(() => ({items:[], tree:null}))
        ]);
        localAssetLibrary = {items:Array.isArray(localData.items) ? localData.items : [], tree:localData.tree || null};
        setAssetLibraryFromResponse(data, {render:false});
        renderAssetLibrary();
    } catch(e) {
        toast(tr('smart.assetLoadFail'));
    }
}
function refreshAssetLibrarySoon(delay=120){
    clearTimeout(assetLibraryRefreshTimer);
    assetLibraryRefreshTimer = setTimeout(async () => {
        await loadAssetLibrary();
        if(mentionPicker?.classList?.contains('open') && mentionSource === 'asset') renderMentionPicker('asset');
    }, delay);
}
function handleAssetLibraryUpdatedMessage(data={}){
    const remoteUpdatedAt = Number(data.updated_at || 0);
    if(remoteUpdatedAt && remoteUpdatedAt <= Number(assetLibraryUpdatedAt || 0)) return;
    refreshAssetLibrarySoon();
}
// 多人协作同步：一个稳定的客户端 id，既用于 WS 连接，也随 saveCanvas 上报，
// 服务器广播 canvas_updated 时带回 client_id，自己发的就忽略，避免自我刷新。
const smartClientId = `canvas_smart_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
let canvasSyncInFlight = false;
let canvasSyncTimer = null;
let canvasMetaPollTimer = null;
let connectionLayerRaf = 0;
function mergeSmartImageLists(localImgs, remoteImgs){
    const out = [];
    const seen = new Set();
    (localImgs || []).forEach(img => {
        const u = img && img.url;
        if(u && seen.has(u)) return;
        if(u) seen.add(u);
        out.push(img);
    });
    (remoteImgs || []).forEach(img => {
        const u = img && img.url;
        if(!u || seen.has(u)) return;
        seen.add(u);
        out.push(img);
    });
    return out;
}
function smartNodeInFlight(node){
    if(smartNodeHasCompletedResult(node)) return false;
    return Boolean(node && (node.running || node.pending || node.queued || node.jimengPending || smartPendingTasks(node).length));
}
function smartNodeHasDisplayResult(node){
    return Boolean((node?.images || []).some(img => img?.url && !img.loopInputPreview));
}
function smartNodeHasCompletedResult(node){
    if(!smartNodeHasDisplayResult(node)) return false;
    if(node?.runFinishedAt) return true;
    return !node?.jimengPending && !smartPendingTasks(node).length && !Number(node?.pending || 0) && !node?.queued;
}
function isTransientUploadPlaceholderNode(node){
    if(!isSmartImageNode(node) || isHistoryGroupNode(node)) return false;
    if(smartNodeHasDisplayResult(node) || smartNodeInFlight(node)) return false;
    if(node?.runAt || node?.runModelPrompt || node?.sourceNodeId || node?.autoBranchOutputSourceId) return false;
    if(node?.loopRootId || node?.loopSourceId || Number.isFinite(Number(node?.loopSlotIndex)) || Number.isFinite(Number(node?.loopRoundIndex))) return false;
    if(Array.isArray(node?.manualInputRefs) && node.manualInputRefs.some(ref => ref?.url)) return false;
    return true;
}
function isStaleEmptyRunPlaceholderNode(node){
    if(!isSmartImageNode(node) || isHistoryGroupNode(node)) return false;
    if(smartNodeHasDisplayResult(node) || smartNodeInFlight(node)) return false;
    if(node?.jimengPending || smartPendingTasks(node).length) return false;
    if(node?.runFinishedAt) return false;
    const hasRunMeta = Boolean(
        node?.runAt ||
        node?.runStartedAt ||
        node?.runPrompt ||
        node?.runModelPrompt ||
        node?.sourceNodeId ||
        node?.autoBranchOutputSourceId ||
        Array.isArray(node?.runPromptRefs) ||
        Array.isArray(node?.runInputRefs)
    );
    if(!hasRunMeta) return false;
    if(node?.loopRootId || node?.loopSourceId || Number.isFinite(Number(node?.loopSlotIndex)) || Number.isFinite(Number(node?.loopRoundIndex))) return false;
    return true;
}
function filterStaleEmptyRunPlaceholders(sourceNodes=[], sourceConnections=[]){
    const removed = new Set((sourceNodes || []).filter(isStaleEmptyRunPlaceholderNode).map(node => node.id));
    if(!removed.size) return {
        nodes:sourceNodes || [],
        connections:sourceConnections || [],
        removed
    };
    return {
        nodes:(sourceNodes || []).filter(node => !removed.has(node.id)),
        connections:(sourceConnections || []).filter(conn => !removed.has(conn?.from) && !removed.has(conn?.to)),
        removed
    };
}
function filterTransientUploadPlaceholders(sourceNodes=[], sourceConnections=[]){
    const connectedNodeIds = new Set();
    const existingNodeIds = new Set((sourceNodes || []).map(node => node?.id).filter(Boolean));
    (sourceConnections || []).forEach(conn => {
        if(conn?.from) connectedNodeIds.add(conn.from);
        if(conn?.to) connectedNodeIds.add(conn.to);
    });
    (sourceNodes || []).forEach(node => {
        const inputIds = Array.isArray(node?.inputNodeIds)
            ? node.inputNodeIds.filter(id => existingNodeIds.has(id))
            : [];
        if(inputIds.length) connectedNodeIds.add(node.id);
        inputIds.forEach(id => connectedNodeIds.add(id));
    });
    const removed = new Set((sourceNodes || [])
        .filter(node => isTransientUploadPlaceholderNode(node) && !connectedNodeIds.has(node.id))
        .map(node => node.id));
    if(!removed.size) return {
        nodes:sourceNodes || [],
        connections:sourceConnections || [],
        removed
    };
    return {
        nodes:(sourceNodes || []).filter(node => !removed.has(node.id)),
        connections:(sourceConnections || []).filter(conn => !removed.has(conn?.from) && !removed.has(conn?.to)),
        removed
    };
}
function liveSmartNode(node){
    if(!node?.id) return node;
    return nodes.find(n => n.id === node.id) || node;
}
function clearSmartNodeBusyState(node){
    if(!node) return node;
    smartNodeRunTokens.delete(node.id);
    node.running = false;
    node.pending = 0;
    node.queued = false;
    delete node.jimengPending;
    delete node.pendingTasks;
    return node;
}
function clearFailedRunMeta(node){
    if(!node) return node;
    clearSmartNodeBusyState(node);
    delete node.runPrompt;
    delete node.runModelPrompt;
    delete node.runPromptRefs;
    delete node.runInputRefs;
    delete node.runSettings;
    delete node.sourceNodeId;
    delete node.runAt;
    delete node.runStartedAt;
    delete node.runFinishedAt;
    delete node.runElapsedMs;
    node.runTimerHidden = true;
    return node;
}
function removeFailedRuntimeOutputNode(node){
    if(!node?.id) return false;
    if(smartNodeHasDisplayResult(node) || smartNodeInFlight(node)) return false;
    if(node.loopRootId || node.loopSourceId || Number.isFinite(Number(node.loopSlotIndex)) || Number.isFinite(Number(node.loopRoundIndex))) return false;
    if(!node.autoBranchOutputSourceId) return false;
    const removeId = node.id;
    cancelSmartNodeTasks(node);
    deletedSmartNodeTombstones.set(removeId, Date.now());
    nodes = nodes.filter(item => item.id !== removeId);
    if(canvas) canvas.connections = (canvas.connections || []).filter(conn => conn.from !== removeId && conn.to !== removeId);
    if(selectedId === removeId) selectedId = '';
    selectedIds = selectedIds.filter(id => id !== removeId);
    if(selectedImage.nodeId === removeId) selectedImage = {nodeId:'', index:-1};
    return true;
}
function closeFailedEmptyRunNode(node){
    if(!node || smartNodeHasDisplayResult(node) || smartNodeInFlight(node)) return false;
    if(removeFailedRuntimeOutputNode(node)) return true;
    clearFailedRunMeta(node);
    delete node.w;
    delete node.h;
    return true;
}
function markSmartNodeComplete(node, meta=null){
    if(!node) return node;
    const keepHidden = node.runTimerHidden === true;
    clearSmartNodeBusyState(node);
    node.runFinishedAt = Number(node.runFinishedAt || 0) || nowMs();
    if(!node.runStartedAt) node.runStartedAt = meta?.createdAt || node.runFinishedAt;
    node.runElapsedMs = Math.max(0, Number(node.runFinishedAt || nowMs()) - Number(node.runStartedAt || node.runFinishedAt || nowMs()));
    node.runTimerHidden = meta?.hideTimer === true || keepHidden;
    return node;
}
function removeHistoryGroupForNode(node){
    if(!node?.id) return false;
    const before = nodes.length;
    nodes = nodes.filter(n => !(isHistoryGroupNode(n) && n.historyFor === node.id));
    if(canvas) canvas.connections = (canvas.connections || []).filter(c => {
        const from = nodes.some(n => n.id === c.from);
        const to = nodes.some(n => n.id === c.to);
        return from && to;
    });
    return nodes.length !== before;
}
function completedDownstreamOutputForNode(sourceNode){
    if(!sourceNode?.id) return null;
    const startedAt = Number(sourceNode.runStartedAt || 0);
    return downstreamImageTargetsFor(sourceNode).find(target => {
        if(!smartNodeHasCompletedResult(target)) return false;
        if(target.sourceNodeId && target.sourceNodeId !== sourceNode.id) return false;
        const finishedAt = Number(target.runFinishedAt || 0);
        return !startedAt || !finishedAt || finishedAt >= startedAt;
    }) || null;
}
function clearSourceBusyStateIfDownstreamDone(sourceNode, options={}){
    if(!sourceNode || !smartNodeInFlight(sourceNode)) return false;
    if(sourceNode.jimengPending || smartPendingTasks(sourceNode).length) return false;
    if(!completedDownstreamOutputForNode(sourceNode)) return false;
    clearSmartNodeBusyState(sourceNode);
    if(!sourceNode.runFinishedAt){
        sourceNode.runFinishedAt = nowMs();
        if(!sourceNode.runStartedAt) sourceNode.runStartedAt = sourceNode.runFinishedAt;
        sourceNode.runElapsedMs = Math.max(0, sourceNode.runFinishedAt - Number(sourceNode.runStartedAt || sourceNode.runFinishedAt));
        sourceNode.runTimerHidden = options.hideTimer === true || sourceNode.runTimerHidden === true;
    }
    return true;
}
function clearCompletedSourceBusyStates(){
    let changed = false;
    (nodes || []).forEach(node => {
        if(clearSourceBusyStateIfDownstreamDone(node)) changed = true;
    });
    return changed;
}
function hideCompletedRunTimers(){
    let changed = false;
    (nodes || []).forEach(node => {
        if(!node || node.type === 'smart-prompt') return;
        if(node.pending || node.running || node.jimengPending || !node.runFinishedAt || node.runTimerHidden) return;
        node.runTimerHidden = true;
        changed = true;
    });
    return changed;
}
function clearCompletedNodeBusyStates(){
    let changed = false;
    (nodes || []).forEach(node => {
        if(!node || !smartNodeHasCompletedResult(node) || !smartNodeInFlight(node)) return;
        markSmartNodeComplete(node);
        changed = true;
    });
    if(clearCompletedSourceBusyStates()) changed = true;
    return changed;
}
function usedCanvasOutputUrls(){
    const used = new Set();
    (nodes || []).forEach(node => (node.images || []).forEach(img => {
        if(img?.url && !img.loopInputPreview) used.add(img.url);
    }));
    return used;
}
function recoverStuckLoopOutputsFromLogs(){ return false; }
function completeSmartNodeWithImages(node, images){
    const copy = {...node, images};
    if(smartNodeHasDisplayResult(copy)) markSmartNodeComplete(copy);
    return copy;
}
function syncRunButtonState(node=selectedNode()){
    if(!runBtn) return;
    // 只在“当前选中节点自己”忙时禁用运行：节点正在生成/排队，或它本身是正在跑的循环。
    // 不再因为“画布上有任意循环/级联在跑”就全局禁用——跑循环时仍可对其他节点点生成。
    runBtn.disabled = smartGenerationPreflightOpen || smartGenerationSubmitting || !isSmartRunnableNode(node) || smartNodeInFlight(node) || smartCascadeIsLoopRunning(node?.id);
}
function mergeSmartNode(local, remote){
    if(local?.clearedAt && Number(local.clearedAt || 0) >= Number(remote?.runFinishedAt || remote?.runAt || remote?.created_at || 0)){
        return {...local, pending:0, running:false, pendingTasks:[]};
    }
    const images = mergeSmartImageLists(local.images, remote.images);
    const localDone = smartNodeHasCompletedResult(local);
    const remoteDone = smartNodeHasCompletedResult(remote);
    const localBusy = smartNodeInFlight(local);
    const remoteBusy = smartNodeInFlight(remote);
    if(localDone && remoteBusy && !remoteDone) return completeSmartNodeWithImages(local, images);
    if(remoteDone && localBusy && !localDone) return completeSmartNodeWithImages(remote, images);
    if(localDone && remoteDone){
        const localFinished = Number(local.runFinishedAt || 0);
        const remoteFinished = Number(remote.runFinishedAt || 0);
        return completeSmartNodeWithImages(remoteFinished >= localFinished ? remote : local, images);
    }
    // 本地正在生成/排队的节点完全以本地为准，只把对方可能多出来的图并进来，绝不被对方旧状态冲掉
    if(smartNodeInFlight(local)){
        return {...local, images};
    }
    // 否则以对方（最新保存方）的布局/标题/设置为基底，但图片取并集——双方生成结果都不丢
    const merged = {...remote, images};
    return smartNodeHasDisplayResult(merged) && (merged.pending || merged.queued || smartPendingTasks(merged).length)
        ? completeSmartNodeWithImages(merged, images)
        : merged;
}
function mergeSmartNodeLists(localNodes, remoteNodes){
    const tombstoneCutoff = Date.now() - 30 * 60 * 1000;
    for(const [id, time] of deletedSmartNodeTombstones.entries()){
        if(Number(time || 0) < tombstoneCutoff) deletedSmartNodeTombstones.delete(id);
    }
    remoteNodes = (remoteNodes || []).filter(n => !deletedSmartNodeTombstones.has(n.id));
    const localById = new Map((localNodes || []).map(n => [n.id, n]));
    const remoteById = new Map((remoteNodes || []).map(n => [n.id, n]));
    const order = [];
    const seen = new Set();
    (localNodes || []).forEach(n => { if(!seen.has(n.id)){ seen.add(n.id); order.push(n.id); } });
    (remoteNodes || []).forEach(n => { if(!seen.has(n.id)){ seen.add(n.id); order.push(n.id); } });
    return order.map(id => {
        const local = localById.get(id);
        const remote = remoteById.get(id);
        if(local && !remote) return local;     // 仅本地存在：保留（我新建的节点；对方删了也宁可复活也不丢结果）
        if(remote && !local) return remote;     // 仅对方存在：加入对方新建的节点
        return mergeSmartNode(local, remote);
    }).filter(Boolean);
}
function mergeSmartConnections(localConns, remoteConns, nodeIds){
    const out = [];
    const seen = new Set();
    [...(localConns || []), ...(remoteConns || [])].forEach(c => {
        if(!c || !nodeIds.has(c.from) || !nodeIds.has(c.to)) return;
        const key = `${c.from}->${c.to}:${c.kind || 'flow'}`;
        if(seen.has(key)) return;
        seen.add(key);
        out.push(c);
    });
    return out;
}
function applyMergedServerCanvas(serverCanvas){
    if(!serverCanvas || !canvas) return false;
    const remoteRawNodes = (Array.isArray(serverCanvas.nodes) ? serverCanvas.nodes : []).map(normalizeLegacySmartNode).filter(Boolean);
    const remoteFiltered = filterTransientUploadPlaceholders(remoteRawNodes, serverCanvas.connections || []);
    const remoteNodes = remoteFiltered.nodes;
    const mergedNodes = mergeSmartNodeLists(nodes, remoteNodes);
    const localFiltered = filterTransientUploadPlaceholders(mergedNodes, canvas.connections || []);
    nodes = localFiltered.nodes;
    const filteredNodeIds = new Set(nodes.map(n => n.id));
    canvas.connections = mergeSmartConnections(canvas.connections, remoteFiltered.connections, filteredNodeIds);
    const cleanedState = clearCompletedNodeBusyStates();
    const recoveredLoopOutputs = recoverStuckLoopOutputsFromLogs();
    canvas.updated_at = Number(serverCanvas.updated_at || canvas.updated_at || 0);
    if(canvas.title !== serverCanvas.title && serverCanvas.title){
        canvas.title = serverCanvas.title;
        const titleEl = document.getElementById('smartTitle');
        if(titleEl) titleEl.textContent = canvas.title;
    }
    render();
    if(typeof scheduleConnectionLayerRefresh === 'function') scheduleConnectionLayerRefresh();
    if(remoteFiltered.removed.size || localFiltered.removed.size || cleanedState || recoveredLoopOutputs) scheduleSave();
    resumeSmartPendingTasks();
    resumeJimengPendingNodes();
    return true;
}
async function mergeReloadCanvasNow(){
    if(!canvasId) return;
    if(dragState || selectionState){
        // 用户正在拖拽/框选，稍后再合并，别打断操作
        scheduleCanvasMergeReload(600);
        return;
    }
    try {
        const res = await fetch(`/api/canvases/${encodeURIComponent(canvasId)}`);
        if(!res.ok) return;
        const data = await res.json();
        if(data && data.canvas) applyMergedServerCanvas(data.canvas);
    } catch(e) {}
}
function scheduleCanvasMergeReload(delay=200){
    clearTimeout(canvasSyncTimer);
    canvasSyncTimer = setTimeout(() => { mergeReloadCanvasNow(); }, delay);
}
function handleCanvasUpdatedMessage(data={}){
    if(!data || data.type !== 'canvas_updated') return;
    if(!canvasId || data.canvas_id !== canvasId) return;
    if(data.client_id && data.client_id === smartClientId) return; // 自己发的，忽略
    if(canvasSyncInFlight) return; // 我正在保存，保存完成/409 合并会处理
    const remoteUpdatedAt = Number(data.updated_at || 0);
    if(remoteUpdatedAt && remoteUpdatedAt <= Number(canvas?.updated_at || 0)) return;
    scheduleCanvasMergeReload(200);
}
function startCanvasMetaPoll(){
    // WS / iframe 转发不可靠时的兜底：定期看服务器 updated_at 是否变新，变新就合并拉取
    if(canvasMetaPollTimer) return;
    canvasMetaPollTimer = setInterval(async () => {
        if(!canvasId || !canvas) return;
        if(canvasSyncInFlight || dragState || selectionState) return;
        try {
            const res = await fetch(`/api/canvases/${encodeURIComponent(canvasId)}/meta`);
            if(!res.ok) return;
            const meta = await res.json();
            if(Number(meta.updated_at || 0) > Number(canvas.updated_at || 0)) mergeReloadCanvasNow();
        } catch(e) {}
    }, 8000);
}
function connectAssetLibrarySyncSocket(){
    if(window.parent && window.parent !== window) return;
    const host = window.location.host;
    if(!host) return;
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    const clientId = smartClientId;
    let socket;
    let retryTimer = null;
    const connect = () => {
        try {
            socket = new WebSocket(`${protocol}://${host}/ws/stats?client_id=${clientId}`);
        } catch(e) {
            retryTimer = setTimeout(connect, 3000);
            return;
        }
        socket.onmessage = event => {
            try {
                const data = JSON.parse(event.data);
                if(data?.type === 'asset_library_updated') handleAssetLibraryUpdatedMessage(data);
                if(data?.type === 'canvas_updated') handleCanvasUpdatedMessage(data);
            } catch(e) {}
        };
        socket.onclose = () => {
            retryTimer = setTimeout(connect, 3000);
        };
        socket.onerror = () => {
            try { socket.close(); } catch(e) {}
        };
    };
    window.addEventListener('beforeunload', () => {
        clearTimeout(retryTimer);
        try { socket?.close(); } catch(e) {}
    });
    connect();
}
function setAssetLibraryFromResponse(data, options={}){
    assetLibrary = data.library || assetLibrary;
    assetLibraryUpdatedAt = Number(assetLibrary.updated_at || assetLibraryUpdatedAt || 0);
    const libs = assetLibraries();
    if(!activeAssetLibraryId) activeAssetLibraryId = assetLibrary.active_library_id || libs[0]?.id || '';
    if(activeAssetLibraryId && activeAssetLibraryId !== LOCAL_ASSET_LIBRARY_ID && !libs.some(lib => lib.id === activeAssetLibraryId)) activeAssetLibraryId = libs[0]?.id || '';
    const cats = assetCategories('image');
    if(activeAssetCategoryId && !cats.some(cat => cat.id === activeAssetCategoryId)) activeAssetCategoryId = '';
    if(!activeAssetCategoryId) activeAssetCategoryId = activeAssetCategory()?.id || '';
    if(mentionAssetCategoryId && !cats.some(cat => cat.id === mentionAssetCategoryId)) mentionAssetCategoryId = '';
    if(!mentionAssetCategoryId) mentionAssetCategoryId = activeAssetCategoryId;
    if(options.render !== false) {
        renderAssetLibrary();
        if(mentionPicker?.classList?.contains('open') && mentionSource === 'asset') renderMentionPicker('asset');
    }
}
function toggleAssetLibrary(open=!assetLibraryOpen){
    if(!assetPanel || !assetToggle) return;
    assetLibraryOpen = !!open;
    assetPanel.classList.toggle('open', assetLibraryOpen);
    assetToggle?.classList.toggle('active', assetLibraryOpen);
    if(assetLibraryOpen) loadAssetLibrary();
    render();
}
function assetCategoryForMention(){
    const cats = assetCategories('image');
    if(!cats.length) return null;
    return cats.find(cat => cat.id === mentionAssetCategoryId)
        || cats.find(cat => cat.id === activeAssetCategoryId)
        || cats.find(cat => (cat.items || []).length)
        || cats[0];
}
function assetMediaKind(item){
    if(!item) return 'image';
    if(item.kind === 'video' || item.type === 'video') return 'video';
    if(item.kind === 'audio' || item.type === 'audio') return 'audio';
    const url = String(item.url || item.thumbnail || '').toLowerCase().split('?')[0];
    const name = String(item.name || '').toLowerCase();
    if(/\.(mp4|webm|mov|m4v|avi|mkv)$/.test(url) || /\.(mp4|webm|mov|m4v|avi|mkv)$/.test(name)) return 'video';
    if(/\.(mp3|wav|m4a|aac|ogg|flac)$/.test(url) || /\.(mp3|wav|m4a|aac|ogg|flac)$/.test(name)) return 'audio';
    if(/\.(json|zip)$/.test(url) || /\.(json|zip)$/.test(name)) return 'file';
    return 'image';
}
function assetNodeImageFromItem(item, fallbackName='asset'){
    const image = {
        url:item?.url || '',
        name:item?.name || fallbackName,
        kind:item?.kind || assetMediaKind(item)
    };
    copyMediaSizeFields(item, image);
    if(item?.asset_uris && typeof item.asset_uris === 'object') image.asset_uris = {...item.asset_uris};
    return image;
}
function assetThumbHtml(item){
    const thumb = item.thumbnail || item.thumb || item.preview || item.url || '';
    const kind = assetMediaKind(item);
    if(kind === 'video'){
        return `<div class="asset-thumb-wrap">${smartVideoPreviewHtml(item, 256, 'class="asset-thumb" loading="lazy" decoding="async" alt=""')}<span class="asset-video-badge"><i data-lucide="film"></i>VIDEO</span></div>`;
    }
    if(kind === 'audio'){
        return `<div class="asset-thumb-wrap media-thumb audio-thumb asset-thumb"><i data-lucide="file-audio"></i><span>${escapeHtml(item.name || 'Audio')}</span></div>`;
    }
    return smartPreviewImgHtml({...item, url:thumb}, 256, 'class="asset-thumb" loading="lazy" decoding="async" alt=""');
}
function renderAssetLibrary(){
    if(!assetPanel || !assetGrid || !assetCategorySelect) return;
    assetTab = 'image';
    document.querySelectorAll('[data-asset-tab]').forEach(btn => btn.classList.toggle('active', btn.dataset.assetTab === assetTab));
    const libs = currentAssetSourceLibraries();
    if(!activeAssetLibraryId || !libs.some(lib => lib.id === activeAssetLibraryId)) activeAssetLibraryId = assetLibrary.active_library_id || assetLibraries()[0]?.id || LOCAL_ASSET_LIBRARY_ID;
    if(assetLibrarySelect){
        assetLibrarySelect.innerHTML = libs.map(lib => `<option value="${escapeHtml(lib.id)}" ${lib.id === activeAssetLibraryId ? 'selected' : ''}>${escapeHtml(lib.name || '资产库')}</option>`).join('');
    }
    const localMode = assetLibraryIsLocal();
    if(assetImageControls) assetImageControls.style.display = 'block';
    if(assetDropZone) assetDropZone.style.display = 'flex';
    assetGrid.style.display = 'grid';
    const baseCats = assetCategories('image');
    const smartClassCats = !localMode ? assetSmartClassEntries().map(entry => ({
        ...entry,
        id:entry.id,
        name:`${entry.label} / ${entry.tag} (${entry.count})`,
        type:'image',
        smartClass:true,
        items:[]
    })) : [];
    const cats = [...baseCats, ...smartClassCats];
    if(!cats.some(cat => cat.id === activeAssetCategoryId)) activeAssetCategoryId = cats[0]?.id || '';
    assetCategorySelect.innerHTML = cats.map(cat => `<option value="${escapeHtml(cat.id)}" ${cat.id === activeAssetCategoryId ? 'selected' : ''}>${escapeHtml(cat.name || tr('smart.assetFolder'))}</option>`).join('');
    const cat = activeAssetCategory();
    const smartClass = parseAssetSmartClassId(activeAssetCategoryId);
    const items = smartClass ? itemsForAssetSmartClass(activeAssetCategoryId) : (cat?.items || []);
    if(assetAddCategoryBtn) assetAddCategoryBtn.disabled = Boolean(smartClass);
    if(assetRenameCategoryBtn) assetRenameCategoryBtn.disabled = !cat || Boolean(smartClass) || (localMode && (cat.id === '__root__' || !cat.id));
    assetGrid.innerHTML = items.length ? items.map(item => `
        <div class="asset-item" draggable="true" data-asset-id="${escapeHtml(item.id)}" data-url="${escapeHtml(item.url)}" data-name="${escapeHtml(item.name || 'asset')}" data-kind="${escapeHtml(assetMediaKind(item))}">
            ${assetThumbHtml(item)}
            <div class="asset-meta">
                <span class="asset-name" ${localMode ? `data-rename-local-asset="${escapeHtml(item.id)}"` : ''} title="${escapeHtml(item.name || '')}">${escapeHtml(item.name || 'asset')}</span>
                ${localMode ? `<button class="asset-mini-btn" type="button" data-rename-local-asset="${escapeHtml(item.id)}" title="${escapeHtml(tr('smart.assetRename'))}"><i data-lucide="pencil"></i></button>
                   <button class="asset-mini-btn" type="button" data-delete-local-asset="${escapeHtml(item.id)}" title="${escapeHtml(tr('common.delete'))}"><i data-lucide="trash-2"></i></button>` : `<button class="asset-mini-btn" type="button" data-rename-asset="${escapeHtml(item.id)}" title="${escapeHtml(tr('smart.assetRename'))}"><i data-lucide="pencil"></i></button>
                   <button class="asset-mini-btn" type="button" data-delete-asset="${escapeHtml(item.id)}" title="${escapeHtml(tr('common.delete'))}"><i data-lucide="trash-2"></i></button>`}
            </div>
        </div>
    `).join('') : `<div class="asset-empty">${escapeHtml(localMode ? '暂无本地素材，拖入图片即可保存' : (smartClass ? '这个智能分类下暂无素材' : tr('smart.assetEmpty')))}</div>`;
    bindAssetItemEvents();
    bindSmartPreviewImageFallbacks(assetGrid);
    refreshIcons();
}
function openAssetNameDialog({title='', value='', placeholder='', cancelValue='', multiline=false }={}){
    if(!assetDialogBackdrop || !assetDialogInput || !assetDialogOk || !assetDialogCancel) return Promise.resolve(cancelValue);
    return new Promise(resolve => {
        assetDialogTitle.textContent = title || tr('smart.assetRename');
        assetDialogInput.value = value || '';
        assetDialogInput.placeholder = placeholder || '';
        assetDialogInput.classList.toggle('is-multiline', Boolean(multiline));
        assetDialogInput.rows = multiline ? 5 : 1;
        assetDialogBackdrop.hidden = false;
        assetDialogBackdrop.classList.add('open');
        assetDialogInput.focus();
        assetDialogInput.select();
        const cleanup = result => {
            assetDialogBackdrop.classList.remove('open');
            assetDialogBackdrop.hidden = true;
            assetDialogOk.onclick = null;
            assetDialogCancel.onclick = null;
            assetDialogInput.onkeydown = null;
            assetDialogBackdrop.onmousedown = null;
            assetDialogInput.classList.remove('is-multiline');
            assetDialogInput.rows = 1;
            resolve(result);
        };
        assetDialogOk.onclick = () => cleanup(assetDialogInput.value.trim());
        assetDialogCancel.onclick = () => cleanup(cancelValue);
        assetDialogInput.onkeydown = event => {
            if(event.key === 'Enter' && !multiline) cleanup(assetDialogInput.value.trim());
            if(event.key === 'Enter' && multiline && (event.ctrlKey || event.metaKey)) cleanup(assetDialogInput.value.trim());
            if(event.key === 'Escape') cleanup(cancelValue);
        };
        assetDialogBackdrop.onmousedown = event => {
            if(event.target === assetDialogBackdrop) cleanup(cancelValue);
        };
    });
}
let assetHoverTimer = 0;
function positionAssetHoverPreview(event){
    if(!assetHoverPreview || assetHoverPreview.hidden || assetHoverPreview.style.display === 'none') return;
    const pad = 14;
    const w = assetHoverPreview.offsetWidth || 260;
    const h = assetHoverPreview.offsetHeight || 300;
    let left = event.clientX - w - 16;
    if(left < pad) left = event.clientX + 16;
    left = Math.max(pad, Math.min(window.innerWidth - w - pad, left));
    const top = Math.max(pad, Math.min(window.innerHeight - h - pad, event.clientY + 12));
    assetHoverPreview.style.left = `${left}px`;
    assetHoverPreview.style.top = `${top}px`;
}
function showAssetHoverPreview(event, item){
    if(!assetHoverPreview || !item?.url) return;
    let media = assetHoverPreview.querySelector('img,video');
    const name = assetHoverPreview.querySelector('.asset-hover-name');
    const kind = assetMediaKind(item);
    if(kind === 'video' && media?.tagName?.toLowerCase() !== 'video'){
        media?.replaceWith(document.createElement('video'));
        media = assetHoverPreview.querySelector('video');
    } else if(kind !== 'video' && media?.tagName?.toLowerCase() !== 'img'){
        media?.replaceWith(document.createElement('img'));
        media = assetHoverPreview.querySelector('img');
    }
    if(kind === 'video'){
        media.muted = true;
        media.loop = true;
        media.playsInline = true;
        media.preload = 'metadata';
        media.controls = false;
        media.disablePictureInPicture = true;
        media.setAttribute('disablepictureinpicture', '');
        media.setAttribute('controlslist', 'nodownload noplaybackrate noremoteplayback');
        media.src = item.url;
        media.play?.().catch(() => {});
    } else {
        // 用预览代理（缩放图）而非原图，悬浮预览更快、不卡。
        media.loading = 'lazy';
        media.decoding = 'async';
        media.src = smartMediaPreviewUrl(item, 768);
        media.alt = 'asset preview';
    }
    name.textContent = item.name || 'asset';
    assetHoverPreview.hidden = false;
    assetHoverPreview.style.display = 'block';
    positionAssetHoverPreview(event);
}
function hideAssetHoverPreview(){
    if(!assetHoverPreview) return;
    assetHoverPreview.style.display = 'none';
    assetHoverPreview.hidden = true;
    const media = assetHoverPreview.querySelector('img,video');
    media?.pause?.();
    media?.removeAttribute('src');
    media?.load?.();
}
function beginAssetInlineRename(assetId){
    const item = (activeAssetCategory()?.items || []).find(x => x.id === assetId);
    const card = [...assetGrid.querySelectorAll('.asset-item')].find(el => el.dataset.assetId === assetId);
    const nameEl = card?.querySelector('.asset-name');
    if(!item || !card || !nameEl || card.querySelector('.asset-rename-input')) return;
    hideAssetHoverPreview();
    const previousName = item.name || 'asset';
    const previousDraggable = card.draggable;
    const input = document.createElement('input');
    input.className = 'asset-rename-input';
    input.type = 'text';
    input.value = previousName;
    input.setAttribute('aria-label', tr('smart.assetRename'));
    card.draggable = false;
    nameEl.replaceWith(input);
    input.focus();
    input.select();
    let done = false;
    const restore = () => {
        if(input.isConnected) input.replaceWith(nameEl);
        card.draggable = previousDraggable;
    };
    const finish = async save => {
        if(done) return;
        done = true;
        const name = input.value.trim();
        if(!save || !name || name === previousName){
            restore();
            return;
        }
        input.disabled = true;
        try {
            if(assetLibraryIsLocal() || item.file){
                const data = await fetch('/api/local-assets/items', {
                    method:'PATCH',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({path:item.file || item.id, name})
                }).then(async r => {
                    if(!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || '重命名失败');
                    return r.json();
                });
                localAssetLibrary = {items:Array.isArray(data.items) ? data.items : localAssetLibrary.items, tree:data.tree || localAssetLibrary.tree};
                activeAssetCategoryId = data.item?.folder || activeAssetCategoryId;
                if(data.old_path && data.item?.url){
                    const oldUrl = `/assets/uploads/${String(data.old_path).split('/').map(encodeURIComponent).join('/')}`;
                    nodes.forEach(node => (node.images || []).forEach(img => {
                        if(img?.url !== oldUrl) return;
                        img.url = data.item.url;
                        img.name = data.item.name || img.name;
                        copyMediaSizeFields(data.item, img);
                    }));
                    scheduleSave();
                }
                renderAssetLibrary();
                render();
                toast('已重命名本地素材，反推提示词和分类索引已同步');
            } else {
                const data = await fetch(`/api/asset-library/items/${encodeURIComponent(assetId)}`, {method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name})}).then(r => r.json());
                setAssetLibraryFromResponse(data);
            }
        } catch(err){
            restore();
            toast(err.message || tr('smart.assetAddFail'));
        }
    };
    input.addEventListener('keydown', event => {
        event.stopPropagation();
        if(event.key === 'Enter'){
            event.preventDefault();
            finish(true);
        } else if(event.key === 'Escape'){
            event.preventDefault();
            finish(false);
        }
    });
    input.addEventListener('pointerdown', event => event.stopPropagation());
    input.addEventListener('mousedown', event => event.stopPropagation());
    input.addEventListener('click', event => event.stopPropagation());
    input.addEventListener('blur', () => finish(true));
}
function bindAssetItemEvents(){
    assetGrid.querySelectorAll('.asset-item').forEach(el => {
        const thumb = el.querySelector('.asset-thumb');
        // 悬浮预览延迟显示：滚动时缩略图会从光标下快速划过、连发 mouseenter，立即加载大图会卡。延迟后只在
        // 光标真正停留时才加载预览，滚动划过不触发。
        thumb?.addEventListener('mouseenter', e => {
            clearTimeout(assetHoverTimer);
            const data = {url:el.dataset.url, name:el.dataset.name, kind:el.dataset.kind};
            const cx = e.clientX, cy = e.clientY;
            assetHoverTimer = setTimeout(() => showAssetHoverPreview({clientX:cx, clientY:cy}, data), 160);
        });
        thumb?.addEventListener('mousemove', e => positionAssetHoverPreview(e));
        thumb?.addEventListener('mouseleave', () => { clearTimeout(assetHoverTimer); hideAssetHoverPreview(); });
        el.addEventListener('dragstart', e => {
            hideAssetHoverPreview();
            e.dataTransfer.effectAllowed = 'copy';
            const item = (activeAssetCategory()?.items || []).find(x => x.id === el.dataset.assetId);
            e.dataTransfer.setData('application/x-smart-asset', JSON.stringify(assetNodeImageFromItem(item || {url:el.dataset.url, name:el.dataset.name, kind:el.dataset.kind})));
            e.dataTransfer.setData('text/plain', el.dataset.url || '');
        });
    });
    assetGrid.querySelectorAll('[data-rename-asset]').forEach(btn => {
        btn.onclick = async e => {
            e.preventDefault(); e.stopPropagation();
            beginAssetInlineRename(btn.dataset.renameAsset);
        };
    });
    assetGrid.querySelectorAll('[data-rename-local-asset]').forEach(btn => {
        btn.onclick = async e => {
            e.preventDefault(); e.stopPropagation();
            beginAssetInlineRename(btn.dataset.renameLocalAsset || '');
        };
    });
    assetGrid.querySelectorAll('[data-delete-local-asset]').forEach(btn => {
        btn.onclick = async e => {
            e.preventDefault(); e.stopPropagation();
            btn.disabled = true;
            await deleteLocalAssetFromPanel(btn.dataset.deleteLocalAsset || '');
        };
    });
    assetGrid.querySelectorAll('[data-delete-asset]').forEach(btn => {
        btn.onclick = async e => {
            e.preventDefault(); e.stopPropagation();
            btn.disabled = true;
            try {
                const data = await fetch(`/api/asset-library/items/${encodeURIComponent(btn.dataset.deleteAsset)}`, {method:'DELETE'}).then(r => r.json());
                setAssetLibraryFromResponse(data);
            } catch(err){
                btn.disabled = false;
                toast(err.message || tr('smart.assetAddFail'));
            }
        };
    });
}
async function addUrlToAssetLibrary(url, name=''){
    if(assetLibraryIsLocal()) return addUrlToLocalAssetLibrary(url, name);
    const cat = activeAssetCategory();
    if(!cat){ toast(tr('smart.assetNoFolder')); return; }
    const data = await fetch('/api/asset-library/items', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({library_id:activeAssetLibraryId, category_id:cat.id, url, name})}).then(async r => {
        if(!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || tr('smart.assetAddFail'));
        return r.json();
    });
    setAssetLibraryFromResponse(data);
    toast(tr('smart.assetSaved'));
}
function localAssetFolderPath(){
    const cat = activeAssetCategory();
    return cat && cat.id !== '__root__' ? (cat.id || '') : '';
}
function setLocalAssetLibraryFromResponse(data){
    localAssetLibrary = {items:Array.isArray(data.items) ? data.items : localAssetLibrary.items, tree:data.tree || localAssetLibrary.tree};
}
async function addFilesToLocalAssetLibrary(files=[]){
    const supported = [...(files || [])].filter(isSupportedUploadFile);
    if(!supported.length) return [];
    const form = new FormData();
    form.append('folder', localAssetFolderPath());
    supported.forEach(file => form.append('files', file, file.name || 'media'));
    const data = await fetch('/api/local-assets/upload', {method:'POST', body:form}).then(async r => {
        if(!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || tr('smart.assetAddFail'));
        return r.json();
    });
    const localData = await fetch('/api/local-assets').then(r => r.ok ? r.json() : {items:[], tree:null});
    setLocalAssetLibraryFromResponse(localData);
    renderAssetLibrary();
    toast(`已保存 ${data.files?.length || 0} 个本地素材`);
    return data.files || [];
}
async function addLocalPathsToLocalAssetLibrary(paths=[]){
    const imported = await importSmartLocalImages(paths);
    return addUrlItemsToLocalAssetLibrary(imported.map(item => ({url:item.url, name:item.name || smartImageNameFromUrl(item.url)})));
}
async function addUrlItemsToLocalAssetLibrary(items=[]){
    const list = (items || []).filter(item => item?.url);
    if(!list.length) return [];
    const data = await fetch('/api/local-assets/import-urls', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({folder:localAssetFolderPath(), items:list.map(item => ({url:item.url, name:item.name || smartImageNameFromUrl(item.url)}))})
    }).then(async r => {
        if(!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || tr('smart.assetAddFail'));
        return r.json();
    });
    setLocalAssetLibraryFromResponse(data);
    renderAssetLibrary();
    toast(`已保存 ${data.count || 0} 个本地素材`);
    return data.files || [];
}
async function addUrlToLocalAssetLibrary(url, name=''){
    return addUrlItemsToLocalAssetLibrary([{url, name:name || smartImageNameFromUrl(url)}]);
}
async function deleteLocalAssetFromPanel(itemId){
    const item = (activeAssetCategory()?.items || []).find(x => x.id === itemId)
        || (localAssetLibrary.items || []).find(x => x.id === itemId || x.file === itemId);
    if(!item) return;
    try {
        const data = await fetch('/api/local-assets/delete', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({names:[item.file || item.id]})
        }).then(async r => {
            if(!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || '删除失败');
            return r.json();
        });
        const localData = await fetch('/api/local-assets').then(r => r.ok ? r.json() : {items:[], tree:null});
        setLocalAssetLibraryFromResponse(localData);
        renderAssetLibrary();
        toast(data.deleted?.length ? '已删除本地素材' : '未找到要删除的本地素材');
    } catch(err){
        toast(err.message || '删除失败');
    }
}
function canvasImageDragPayload(node, index=0){
    const img = node?.images?.[index];
    if(!img?.url) return null;
    return {url:img.url, name:img.name || node.title || 'image'};
}
// 迁移旧数据：早期把图片节点作为成员（items[]）放进分组的画布，统一把这些图片吸收进 group.images，
// 让它们显示为卡片内的缩略图网格（新模型）。一次性、幂等。
function migrateSmartGroupImageMembers(){
    let changed = false;
    nodes.filter(group => isSmartGroupNode(group) && !isSmartFrameGroup(group)).forEach(group => {
        const imageMemberIds = (Array.isArray(group.items) ? group.items : [])
            .map(id => nodes.find(n => n.id === id))
            .filter(m => m && isSmartImageNode(m) && (m.images || []).some(img => img?.url))
            .map(m => m.id);
        imageMemberIds.forEach(id => {
            const member = nodes.find(n => n.id === id);
            if(member && absorbImageNodeIntoSmartGroup(group, member)) changed = true;
        });
    });
    return changed;
}
async function loadCanvas(){
    if(!canvasId) return;
    try {
        const res = await fetch(`/api/canvases/${encodeURIComponent(canvasId)}`);
        if(!res.ok) return;
        const data = await res.json();
        canvas = data.canvas;
        rememberCanvasListProject(canvas.project || 'default');
        canvasUsesConnections = Object.prototype.hasOwnProperty.call(canvas || {}, 'connections');
        document.title = canvas.title || tr('canvas.smartCanvas');
        document.getElementById('smartTitle').textContent = canvas.title || tr('canvas.smartCanvas');
        nodes = (Array.isArray(canvas.nodes) ? canvas.nodes : []).map(normalizeLegacySmartNode).filter(Boolean);
        canvas.connections = Array.isArray(canvas.connections) ? canvas.connections : [];
        const placeholderFiltered = filterTransientUploadPlaceholders(nodes, canvas.connections);
        nodes = placeholderFiltered.nodes;
        canvas.connections = placeholderFiltered.connections;
        const cleanedCaseStyleRefs = cleanupCaseStyleReferenceInputs();
        const staleRunFiltered = filterStaleEmptyRunPlaceholders(nodes, canvas.connections);
        nodes = staleRunFiltered.nodes;
        canvas.connections = staleRunFiltered.connections;
        migrateSmartGroupImageMembers();
        nodes.forEach(n => {
            const pendingTasks = smartPendingTasks(n);
            if(pendingTasks.length){
                n.pending = Math.max(pendingTasks.length, Number(n.pending || 0) || pendingTasks.length);
                n.running = false;
            } else if(smartNodeHasDisplayResult(n)){
                markSmartNodeComplete(n, {hideTimer:true});
            } else if(n.pending || n.queued){
                clearSmartNodeBusyState(n);
            }
        });
        const cleanedCompletedState = clearCompletedNodeBusyStates();
        const recoveredLoopOutputs = recoverStuckLoopOutputsFromLogs();
        const hiddenCompletedTimers = hideCompletedRunTimers();
        const cleanedDetachedInputs = cleanupDetachedRunInputRefs();
        viewport = {...viewport, ...(canvas.viewport || {})};
        viewport.scale = safeScale(viewport.scale);
        if(canvas.settings) settings = stripDeprecatedSmartGenerationSettings({...settings, ...canvas.settings});
        normalizeSmartVideoModeSettings(settings, true);
        nodes.forEach(node => {
            if(node.runSettings) normalizeSmartVideoModeSettings(node.runSettings, true);
        });
        canvasDefaultSmartSettings = cloneSmartSettings(settings);
        loadRecentSmartSettings();
        updateProviderModels();
        applyViewport();
        render();
        if(placeholderFiltered.removed.size || staleRunFiltered.removed.size || cleanedCaseStyleRefs || cleanedDetachedInputs || cleanedCompletedState || recoveredLoopOutputs || hiddenCompletedTimers) scheduleSave();
        resumeSmartPendingTasks();
        resumeJimengPendingNodes();
        startCanvasMetaPoll();
    } catch(e) { toast(tr('smart.toastCanvasFail')); }
}
function scheduleSave(){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveCanvas, 450);
}
async function saveCanvas(){
    if(!canvasId || !canvas) return;
    savePromptDraftForCurrent();
    nodes.forEach(node => {
        node.images = (node.images || []).map(img => mediaItemForStorage(stripImageGenerationMeta(img)));
        if(node.runSettings) node.runSettings = settingsForStorage(node.runSettings);
    });
    canvas.nodes = nodes;
    canvas.settings = settingsForStorage(canvasDefaultSmartSettings || initialSmartSettings);
    canvas.viewport = {...viewport};
    const storageCanvas = canvasForStorage();
    canvasSyncInFlight = true;
    try {
        const res = await fetch(`/api/canvases/${encodeURIComponent(canvasId)}`, {
            method:'PUT',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                title:storageCanvas.title || tr('smart.title'),
                icon:storageCanvas.icon || 'sparkles',
                nodes:storageCanvas.nodes || [],
                connections:storageCanvas.connections || [],
                viewport:storageCanvas.viewport || {x:0,y:0,scale:1},
                logs:storageCanvas.logs || [],
                settings:storageCanvas.settings,
                base_updated_at:storageCanvas.updated_at || canvas.updated_at || 0,
                client_id:smartClientId
            })
        });
        if(res.ok){
            const data = await res.json();
            if(data.canvas && data.canvas.updated_at) canvas.updated_at = data.canvas.updated_at;
        } else if(res.status === 409) {
            // 冲突：别人先保存了。合并对方的状态（节点 id 合并、图片取并集，谁都不丢），
            // 然后用对方最新的 updated_at 作为基底重存，把合并结果落盘——而不是直接覆盖对方。
            const data = await res.json().catch(() => ({}));
            const serverCanvas = data.detail?.canvas;
            if(serverCanvas){
                applyMergedServerCanvas(serverCanvas);
                nodes.forEach(node => {
                    node.images = (node.images || []).map(img => mediaItemForStorage(stripImageGenerationMeta(img)));
                    if(node.runSettings) node.runSettings = settingsForStorage(node.runSettings);
                });
                canvas.nodes = nodes;
            } else if(data.detail?.updated_at) {
                canvas.updated_at = data.detail.updated_at;
            }
            clearTimeout(saveTimer);
            saveTimer = setTimeout(saveCanvas, 300);
        }
    } catch(e) {} finally {
        canvasSyncInFlight = false;
    }
}
function imageMetaFromNode(node){
    return {};
}
function applyNodeMetaToImage(image, node){
    return stripImageGenerationMeta(image);
}
function inheritNodeMetaFromImage(node){
    if(!node) return;
    node.images = (node.images || []).map(img => stripImageGenerationMeta(img));
}
function createNode(x, y, images=[], options={}){
    if(!options.skipUndo) pushUndo();
    const nodeImages = (images || []).map(img => ({...img}));
    const node = {id:uid('smart'), type:'smart-image', x, y, title:nodeImages.length > 1 ? 'Group' : nodeImages.length ? 'Image' : tr('smart.createImportNode'), images:nodeImages, created_at:Date.now()};
    node.scale = nodeImages.length > 1 ? MEDIA_GROUP_DEFAULT_SCALE : mediaNodeDefaultScale(node);
    inheritNodeMetaFromImage(node);
    nodes.push(node);
    if(options.select !== false) selectedId = node.id;
    render();
    scheduleSave();
    return node;
}
function createPromptNode(x, y, options={}){
    if(!options.skipUndo) pushUndo();
    const providerId = resolveChatProviderId();
    const node = {
        id:uid('prompt'),
        type:'smart-prompt',
        x,
        y,
        w:316,
        h:240,
        title:'Prompt',
        text:'',
        promptSeparator:';',
        promptSplitEnabled:false,
        llmEnabled:false,
        llmProvider:providerId,
        llmModel:resolveChatModel('', providerId),
        llmSystemEnabled:false,
        llmSystemPrompt:'You are a helpful prompt assistant.',
        llmInstruction:'',
        cameraEnabled:false,
        cameraFocalLength:PROMPT_CAMERA_DEFAULT_FOCAL,
        cameraAzimuth:'front',
        cameraElevation:'eye',
        posterCopyEnabled:false,
        created_at:Date.now()
    };
    nodes.push(node);
    if(options.select !== false) selectedId = node.id;
    render();
    scheduleSave();
    return node;
}
function createLoopNode(x, y, options={}){
    if(!options.skipUndo) pushUndo();
    const node = {id:uid('loop'), type:'smart-loop', x, y, w:340, h:168, title:'Loop', count:1, mode:'serial', showPrompt:false, imageInput:false, loopStart:1, imageBatchSize:1, variablePrompt:'', created_at:Date.now()};
    nodes.push(node);
    if(options.select !== false) selectedId = node.id;
    render();
    scheduleSave();
    return node;
}
function createSmartGroupNode(x, y, options={}){
    if(!options.skipUndo) pushUndo();
    const node = {id:uid('group'), type:'smart-group', x, y, w:SMART_GROUP_DEFAULT_WIDTH, h:SMART_GROUP_DEFAULT_HEIGHT, title:'智能分组', items:[], created_at:Date.now()};
    nodes.push(node);
    if(options.select !== false) selectedId = node.id;
    render();
    scheduleSave();
    return node;
}
function cloneSmartNode(node, dx=0, dy=0){
    const copy = JSON.parse(JSON.stringify(node));
    copy.id = uid(
        node.type === 'smart-prompt'
            ? 'prompt'
            : node.type === 'smart-loop'
            ? 'loop'
            : node.type === 'smart-group'
            ? 'group'
            : 'smart'
    );
    copy.x = (Number(node.x) || 0) + dx;
    copy.y = (Number(node.y) || 0) + dy;
    copy.running = false;
    copy.pending = 0;
    if(copy.type === 'smart-group') copy.title = copy.title || '智能分组';
    delete copy.runStartedAt;
    delete copy.runFinishedAt;
    delete copy.runElapsedMs;
    delete copy.runTimerHidden;
    return copy;
}
function clipboardSelectionNodeIds(){
    const rootIds = selectedNodeIds();
    const copiedIds = [];
    const seen = new Set();
    const visit = id => {
        if(!id || seen.has(id)) return;
        const node = nodes.find(n => n.id === id);
        if(!node) return;
        seen.add(id);
        copiedIds.push(id);
        if(isSmartGroupNode(node)){
            (node.items || []).forEach(visit);
        }
    };
    rootIds.forEach(visit);
    return {rootIds, copiedIds};
}
function smartNodeClipboardEnvelope(clip){
    return {
        format:SMART_CANVAS_NODE_CLIPBOARD_FORMAT,
        version:1,
        canvas_type:'smart',
        copied_at:Date.now(),
        nodes:Array.isArray(clip?.nodes) ? clip.nodes : [],
        connections:Array.isArray(clip?.connections) ? clip.connections : [],
        rootIds:Array.isArray(clip?.rootIds) ? clip.rootIds : []
    };
}
function fallbackWriteClipboardText(text){
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', 'readonly');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand('copy');
        textarea.remove();
        return ok;
    } catch(e) {
        return false;
    }
}
async function writeSmartNodeClipboardToSystem(clip){
    const text = JSON.stringify(smartNodeClipboardEnvelope(clip));
    try {
        if(navigator.clipboard?.writeText){
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch(e) {}
    return fallbackWriteClipboardText(text);
}
function normalizeImportedSmartNodeBundle(data){
    // 仅用于读取和迁移旧版画布数据：兼容早期节点剪贴板里的 workflow 包装字段，不恢复工作流导入/导出入口。
    if(Array.isArray(data)) return {nodes:data, connections:[]};
    if(Array.isArray(data?.nodes)) return {nodes:data.nodes, connections:Array.isArray(data.connections) ? data.connections : []};
    if(Array.isArray(data?.workflow?.nodes)) return {nodes:data.workflow.nodes, connections:Array.isArray(data.workflow.connections) ? data.workflow.connections : []};
    return {nodes:[], connections:[]};
}
function normalizeSmartNodeClipboardPayload(data){
    if(!data || typeof data !== 'object') return null;
    const imported = normalizeImportedSmartNodeBundle(data);
    const srcNodes = (imported.nodes || []).filter(Boolean).map(serializableSmartNode).filter(Boolean);
    if(!srcNodes.length) return null;
    const idSet = new Set(srcNodes.map(node => node.id).filter(Boolean));
    const srcConnections = (imported.connections || [])
        .filter(conn => conn && idSet.has(conn.from) && idSet.has(conn.to))
        .map(conn => JSON.parse(JSON.stringify(conn)));
    const requestedRoots = Array.isArray(data.rootIds) ? data.rootIds : [];
    const rootIds = requestedRoots.filter(id => idSet.has(id));
    return {
        nodes:srcNodes,
        connections:srcConnections,
        rootIds:rootIds.length ? rootIds : srcNodes.map(node => node.id).filter(Boolean)
    };
}
function parseSmartNodeClipboardText(text){
    const raw = String(text || '').trim();
    if(!raw || !raw.startsWith('{')) return null;
    try {
        const data = JSON.parse(raw);
        if(data?.format && ![
            SMART_CANVAS_NODE_CLIPBOARD_FORMAT,
            'infinite-smart-canvas-workflow'
        ].includes(data.format) && !Array.isArray(data?.nodes) && !Array.isArray(data?.workflow?.nodes)){
            return null;
        }
        return normalizeSmartNodeClipboardPayload(data);
    } catch(e) {
        return null;
    }
}
async function readSmartNodeClipboardFromSystem(){
    try {
        if(!navigator.clipboard?.readText) return null;
        const text = await navigator.clipboard.readText();
        return parseSmartNodeClipboardText(text);
    } catch(e) {
        return null;
    }
}
function setSmartNodeClipboardPayload(clip){
    if(!clip?.nodes?.length) return false;
    nodeClipboard = {
        nodes:clip.nodes.map(serializableSmartNode),
        connections:JSON.parse(JSON.stringify(clip.connections || [])),
        rootIds:Array.isArray(clip.rootIds) ? clip.rootIds.slice() : []
    };
    imageClipboard = null;
    return true;
}
function copySelectedNodes(){
    if(!canvas || isEditableTarget(document.activeElement)) return false;
    const {rootIds, copiedIds} = clipboardSelectionNodeIds();
    const copiedNodes = copiedIds.map(id => nodes.find(n => n.id === id)).filter(Boolean);
    if(!copiedNodes.length) return false;
    const idSet = new Set(copiedNodes.map(n => n.id));
    const copiedConnections = (canvas.connections || []).filter(c => idSet.has(c.from) && idSet.has(c.to));
    nodeClipboard = {
        nodes:copiedNodes.map(serializableSmartNode),
        connections:JSON.parse(JSON.stringify(copiedConnections)),
        rootIds:rootIds.filter(id => idSet.has(id))
    };
    imageClipboard = null;
    writeSmartNodeClipboardToSystem(nodeClipboard).then(ok => {
        toast(ok ? `已复制 ${rootIds.length} 个模块，可跨项目画布粘贴` : `已复制 ${rootIds.length} 个模块（当前页面内可粘贴）`);
    });
    return true;
}
async function pasteSmartNodeClipboardFromSystem(){
    if(!canvas || isEditableTarget(document.activeElement)) return false;
    const clip = await readSmartNodeClipboardFromSystem();
    if(!setSmartNodeClipboardPayload(clip)) return false;
    return pasteNodes();
}
function pasteNodes(){
    if(!canvas || !nodeClipboard?.nodes?.length || isEditableTarget(document.activeElement)) return false;
    lastNodePasteAt = Date.now();
    pushUndo();
    const sourceNodes = nodeClipboard.nodes;
    const xs = sourceNodes.map(n => Number(n.x) || 0);
    const ys = sourceNodes.map(n => Number(n.y) || 0);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const p = lastMouseWorld || viewportCenter();
    const dx = p.x - cx;
    const dy = p.y - cy;
    const idMap = new Map();
    const copies = sourceNodes.map(n => {
        const copy = cloneSmartNode(n, dx, dy);
        idMap.set(n.id, copy.id);
        return copy;
    });
    copies.forEach(copy => {
        if(Array.isArray(copy.inputNodeIds)){
            copy.inputNodeIds = copy.inputNodeIds.map(id => idMap.get(id)).filter(Boolean);
        }
        if(copy.sourceNodeId) copy.sourceNodeId = idMap.get(copy.sourceNodeId) || '';
        if(copy.autoBranchOutputSourceId) copy.autoBranchOutputSourceId = idMap.get(copy.autoBranchOutputSourceId) || '';
        if(copy.loopRootId) copy.loopRootId = idMap.get(copy.loopRootId) || '';
        if(isSmartGroupNode(copy) && Array.isArray(copy.items)){
            copy.items = copy.items.map(id => idMap.get(id)).filter(Boolean);
        }
        if(Array.isArray(copy.manualInputRefs)){
            copy.manualInputRefs = copy.manualInputRefs.map(ref => {
                if(!ref || typeof ref !== 'object') return ref;
                const sourceId = ref.sourceNodeId || ref.nodeId || '';
                if(!sourceId) return ref;
                const mappedId = idMap.get(sourceId) || '';
                return {
                    ...ref,
                    sourceNodeId:mappedId,
                    ...(ref.nodeId ? {nodeId:mappedId} : {})
                };
            });
        }
    });
    const newConnections = (nodeClipboard.connections || []).map(conn => ({
        ...conn,
        from:idMap.get(conn.from),
        to:idMap.get(conn.to)
    })).filter(conn => conn.from && conn.to && conn.from !== conn.to);
    canvas.connections = [...(canvas.connections || []), ...newConnections];
    nodes.push(...copies);
    const pastedRootIds = (nodeClipboard.rootIds || sourceNodes.map(n => n.id))
        .map(id => idMap.get(id))
        .filter(Boolean);
    selectedId = pastedRootIds.length === 1 ? pastedRootIds[0] : '';
    selectedIds = pastedRootIds.length > 1 ? pastedRootIds : [];
    selectedImage = {nodeId:'', index:-1};
    render();
    scheduleSave();
    toast(`已粘贴 ${pastedRootIds.length} 个模块`);
    return true;
}
function cloneClipboardMediaItem(item){
    try {
        return JSON.parse(JSON.stringify(item || {}));
    } catch(e) {
        return {...(item || {})};
    }
}
function selectedImageClipboardItem(){
    const nodeId = selectedImage.nodeId || '';
    const index = Number(selectedImage.index);
    if(!nodeId || !Number.isFinite(index) || index < 0) return null;
    const node = nodes.find(n => n.id === nodeId);
    if(!node) return null;
    const direct = imageForDisplay(node.images?.[index]);
    let item = direct?.url ? direct : null;
    if(!item && isSmartGroupNode(node)){
        const refs = smartGroupImageRefs(node);
        const ref = refs.find(r => r.nodeId === node.id && Number(r.index) === index) || refs[index];
        item = ref?.item?.url ? ref.item : null;
    }
    if(!item?.url) return null;
    const copy = cloneClipboardMediaItem(item);
    copy.kind = copy.kind || mediaKindForItem(copy);
    return {item:copy, sourceNodeId:node.id, sourceImageIndex:index};
}
function copySelectedImage(){
    if(!canvas || isEditableTarget(document.activeElement)) return false;
    const payload = selectedImageClipboardItem();
    if(!payload) return false;
    imageClipboard = {...payload, copiedAt:Date.now()};
    nodeClipboard = null;
    toast('已复制图片');
    return true;
}
function pasteImageClipboard(){
    if(!canvas || isEditableTarget(document.activeElement) || !imageClipboard?.item?.url) return false;
    lastNodePasteAt = Date.now();
    pushUndo();
    const center = lastMouseWorld || viewportCenter();
    const item = cloneClipboardMediaItem(imageClipboard.item);
    item.kind = item.kind || mediaKindForItem(item);
    const node = createImageNodeAt({x:center.x + 28, y:center.y + 28}, [item], {select:true, skipUndo:true});
    if(!node) return false;
    selectedIds = [];
    selectedId = node.id;
    selectedImage = {nodeId:node.id, index:0};
    render();
    scheduleSave();
    toast('已粘贴图片');
    return true;
}
// 跨页"素材库 → 画布"剪贴板：素材库管理页把所选素材写进这个 localStorage key，
// 画布里按 Ctrl+V 读取并批量生成图片节点（网格平铺），用完即清空（一次性）。
const SMART_CANVAS_ASSET_INBOX_KEY = 'smart_canvas_asset_inbox';
function readAssetInbox(){
    try {
        const data = JSON.parse(localStorage.getItem(SMART_CANVAS_ASSET_INBOX_KEY) || 'null');
        const items = Array.isArray(data?.items) ? data.items.filter(it => it && it.url) : [];
        if(!items.length) return null;
        if(data.ts && (Date.now() - Number(data.ts)) > 30 * 60 * 1000) return null; // 30 分钟内有效
        return items;
    } catch(e){ return null; }
}
function pasteAssetsFromInbox(){
    const items = readAssetInbox();
    if(!items) return false;
    const center = lastMouseWorld || viewportCenter();
    const cell = 260; // 网格间距（世界坐标）
    const cols = Math.max(1, Math.min(items.length, Math.ceil(Math.sqrt(items.length))));
    const rows = Math.ceil(items.length / cols);
    const startX = center.x - (cols - 1) * cell / 2;
    const startY = center.y - (rows - 1) * cell / 2;
    pushUndo();
    const created = [];
    items.forEach((it, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const p = {x: startX + c * cell, y: startY + r * cell};
        const node = createImageNodeAt(p, [assetNodeImageFromItem(it)], {skipUndo:true, select:false});
        if(node) created.push(node.id);
    });
    selectedId = created.length === 1 ? created[0] : '';
    selectedIds = created.length > 1 ? created : [];
    selectedImage = {nodeId:'', index:-1};
    lastNodePasteAt = Date.now();
    try { localStorage.removeItem(SMART_CANVAS_ASSET_INBOX_KEY); } catch(e){}
    render();
    scheduleSave();
    toast(`已粘贴 ${created.length} 个素材到画布`);
    return true;
}
function duplicateForAltDrag(node){
    const ids = (isNodeSelected(node.id) ? selectedNodeIds() : [node.id]);
    const sourceNodes = ids.map(id => nodes.find(n => n.id === id)).filter(Boolean);
    if(!sourceNodes.length) return node;
    pushUndo();
    const idMap = new Map();
    const copies = sourceNodes.map(n => {
        const copy = cloneSmartNode(n, 0, 0);
        idMap.set(n.id, copy.id);
        return copy;
    });
    copies.forEach(copy => {
        if(Array.isArray(copy.inputNodeIds)) copy.inputNodeIds = copy.inputNodeIds.map(id => idMap.get(id)).filter(Boolean);
        if(copy.sourceNodeId) copy.sourceNodeId = idMap.get(copy.sourceNodeId) || '';
    });
    const idSet = new Set(sourceNodes.map(n => n.id));
    const copiedConnections = (canvas.connections || []).filter(c => idSet.has(c.from) && idSet.has(c.to));
    const newConnections = copiedConnections.map(conn => ({...conn, from:idMap.get(conn.from), to:idMap.get(conn.to)})).filter(conn => conn.from && conn.to && conn.from !== conn.to);
    canvas.connections = [...(canvas.connections || []), ...newConnections];
    nodes.push(...copies);
    selectedId = '';
    selectedIds = [];
    selectedImage = {nodeId:'', index:-1};
    const dragCopy = copies.find(c => c.id === idMap.get(node.id)) || copies[0];
    render();
    scheduleSave();
    return dragCopy;
}
function shellPoint(event){
    const rect = shell.getBoundingClientRect();
    return {x:event.clientX - rect.left, y:event.clientY - rect.top};
}
function renderConnections(){
    const conns = (canvas?.connections || []).map((conn, index) => ({...conn, index})).filter(c => nodes.some(n => n.id === c.from) && nodes.some(n => n.id === c.to));
    const cascadeKeys = cascadeConnectionKeys();
    const activeCascadeCount = (smartCascadeRunPath?.states && Object.values(smartCascadeRunPath.states).filter(state => state && state !== 'done').length) || 0;
    const reduceMotion = activeCascadeCount > 24;
    // 合并连线：同一来源连到同一分组的多个成员，合成一条到分组的连线（A→A1/A2/A3 显示为 A→分组），
    // 减少“每张图都拖一条线”的杂乱。history 连线不合并。
    const buckets = new Map();
    const items = [];
    conns.forEach(conn => {
        const kind = conn.kind || 'flow';
        const fromScope = kind === 'history' ? '' : smartGroupScopeId(conn.from);
        const toScope = kind === 'history' ? '' : smartGroupScopeId(conn.to);
        // 同一分组内部的连线（成员↔成员、成员↔分组本体）属于内部关系，入组后隐藏，保持整洁。
        if(fromScope && fromScope === toScope) return;
        // 终点是某分组的成员：把同一来源连到该分组各成员的线合并成一条到分组的线。
        const isMemberTarget = toScope && toScope !== conn.to;
        if(isMemberTarget){
            const key = `${conn.from}|${toScope}|${kind}`;
            let b = buckets.get(key);
            if(!b){ b = {merged:true, from:conn.from, toId:toScope, kind, indices:[], targets:[]}; buckets.set(key, b); items.push(b); }
            b.indices.push(conn.index);
            b.targets.push(conn.to);
        } else {
            items.push({merged:false, from:conn.from, toId:conn.to, kind, indices:[conn.index], targets:[conn.to]});
        }
    });
    const paths = items.map(item => {
        const fromNode = nodes.find(n => n.id === item.from);
        const toNode = nodes.find(n => n.id === item.toId);
        if(!fromNode || !toNode) return '';
        const fr = nodeRect(fromNode), tr = nodeRect(toNode);
        const kind = item.kind;
        const isHistory = kind === 'history';
        const dataIndex = item.indices.join(',');
        const isInsertPreview = item.indices.some(i => loopInsertPreview?.index === i);
        const edgeKeys = item.targets.map(t => `${item.from}->${t}`);
        const states = edgeKeys.map(smartCascadeEdgeState).filter(Boolean);
        let cascadeState = '';
        if(states.includes('active')) cascadeState = 'active';
        else if(states.some(s => s !== 'done')) cascadeState = states.find(s => s !== 'done');
        else if(states.length) cascadeState = 'done';
        const isCascade = !isHistory && (edgeKeys.some(k => cascadeKeys.has(k)) || Boolean(cascadeState) || isInsertPreview);
        const isPendingLine = !isCascade && item.targets.some(t => nodes.find(n => n.id === t)?.pending);
        const fx = isHistory ? fr.x + fr.width / 2 : fr.x + fr.width;
        const fy = isHistory ? fr.y + fr.height : fr.y + fr.height / 2;
        const tx = isHistory ? tr.x + tr.width / 2 : tr.x;
        const ty = isHistory ? tr.y : tr.y + tr.height / 2;
        const dx = Math.max(50, Math.abs(tx - fx) * 0.45);
        const dy = Math.max(36, Math.abs(ty - fy) * 0.45);
        const curve = isHistory
            ? `M${fx} ${fy} C ${fx} ${fy+dy}, ${tx} ${ty-dy}, ${tx} ${ty}`
            : `M${fx} ${fy} C ${fx+dx} ${fy}, ${tx-dx} ${ty}, ${tx} ${ty}`;
        const mx = (fx + tx) / 2, my = (fy + ty) / 2;
        const cls = [
            isPendingLine ? 'conn-pending' : '',
            isCascade ? 'conn-cascade' : '',
            isCascade && cascadeState === 'done' ? 'conn-cascade-done' : '',
            isCascade && Boolean(cascadeState) && cascadeState !== 'done' ? 'conn-cascade-wait' : '',
            isCascade && cascadeState === 'active' ? 'conn-cascade-active' : '',
            isHistory ? 'conn-history' : ''
        ].filter(Boolean).join(' ');
        const color = isCascade ? '#16a34a' : isHistory ? 'rgba(100,116,139,0.46)' : kind === 'input' ? 'rgba(100,116,139,0.62)' : 'rgba(148,163,184,0.62)';
        const opacity = isPendingLine ? '.82' : '1';
        const width = kind === 'input' ? '1.9' : '1.6';
        return `<path class="${cls}" d="${curve}" stroke="${color}" stroke-width="${width}" fill="none" opacity="${opacity}"></path><path class="conn-hit" data-conn-index="${dataIndex}" d="${curve}" stroke="transparent" stroke-width="14" fill="none"></path><circle cx="${tx}" cy="${ty}" r="3.5" fill="${color}" opacity=".66"></circle><g class="conn-cut" data-conn-index="${dataIndex}" transform="translate(${mx} ${my})"><circle r="8" fill="var(--card)" stroke="${color}" stroke-width="1.4"></circle><path d="M-3 -3 L3 3 M3 -3 L-3 3" stroke="${color}" stroke-width="1.5" stroke-linecap="round"></path></g>`;
    }).join('');
    return `<svg class="connection-layer ${reduceMotion ? 'conn-reduce-motion' : ''}" width="6000" height="4000" viewBox="0 0 6000 4000" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
}
function refreshConnectionLayer(){
    connectionLayerRaf = 0;
    const oldSvg = world.querySelector('svg.connection-layer');
    if(!oldSvg) return;
    const tpl = document.createElement('template');
    tpl.innerHTML = renderConnections().trim();
    const nextSvg = tpl.content.firstElementChild;
    if(nextSvg) oldSvg.replaceWith(nextSvg);
    bindConnectionEvents();
}
function scheduleConnectionLayerRefresh(){
    if(connectionLayerRaf) return;
    connectionLayerRaf = requestAnimationFrame(refreshConnectionLayer);
}
let interactionLayerRaf = 0;
// 拖动/缩放节点时，每个 mousemove 都全量重建连线 SVG + 小地图会掉帧；
// 用 requestAnimationFrame 把它们合并成每帧最多刷新一次（节点本身的位移仍是即时的）。
function scheduleInteractionLayerRefresh(){
    if(interactionLayerRaf) return;
    interactionLayerRaf = requestAnimationFrame(() => {
        interactionLayerRaf = 0;
        refreshConnectionLayer();
        renderMinimap();
    });
}
function moveNodeElementsDuringDrag(){
    if(!dragState) return;
    const groupItems = dragState.group || [{id:dragState.id}];
    groupItems.map(item => item.id).forEach(id => {
        const n = nodes.find(x => x.id === id);
        const el = world.querySelector(`.image-node[data-id="${CSS.escape(id)}"]`);
        if(n && el){
            el.style.left = `${n.x || 0}px`;
            el.style.top = `${n.y || 0}px`;
        }
    });
    const active = selectedNode();
    if(active && (dragState.group || [{id:dragState.id}]).some(item => item.id === active.id)){
        positionComposerForNode(active);
    }
    scheduleInteractionLayerRefresh();
}
function updateNodeElementDuringResize(node){
    if(!node) return;
    const el = world.querySelector(`.image-node[data-id="${CSS.escape(node.id)}"]`);
    if(!el){
        render();
        return;
    }
    const imgs = isSmartGroupNode(node) ? smartGroupImageRefs(node).map(ref => ref.item) : (node.images || []);
    const layout = imageLayout(imgs, nodeScale(node), node);
    el.style.width = `${layout.width}px`;
    el.style.height = `${layout.height}px`;
    const body = el.querySelector('.node-body');
    if(body){
        const loadingSingle = body.querySelector('.loading-cell.single');
        if(loadingSingle){
            loadingSingle.style.width = `${layout.width}px`;
            loadingSingle.style.height = `${layout.height}px`;
        }
        const loadingGrid = body.querySelector('.loading-skeleton');
        if(loadingGrid){
            const count = Math.max(1, Number(node.pending) || 1);
            const cols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(count))));
            const rows = Math.ceil(count / cols);
            loadingGrid.style.width = `${layout.width}px`;
            loadingGrid.style.height = `${layout.height}px`;
            loadingGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            loadingGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        }
        const maxVisibleRows = isSmartGroupNode(node)
            ? (smartGroupCompactMembers(node).length ? Number(layout.rows || 1) : SMART_GROUP_MAX_VISIBLE_ROWS)
            : MEDIA_GROUP_MAX_VISIBLE_ROWS;
        const grid = body.querySelector('.thumb-grid');
        if(grid){
            grid.style.setProperty('--thumb-cols', layout.cols);
            grid.style.setProperty('--thumb-size', `${layout.thumb}px`);
            const visibleRows = Math.max(1, Math.min(maxVisibleRows, Number(layout.visibleRows || layout.rows || 1)));
            const maxHeight = visibleRows * Number(layout.thumb || 96) + Math.max(0, visibleRows - 1) * 8;
            grid.style.setProperty('--thumb-max-height', `${maxHeight}px`);
            grid.querySelectorAll('.thumb-item').forEach((itemEl, index) => {
                applyThumbDisplaySizeToElement(itemEl, imgs[index], layout.thumb);
            });
        }
        const wrap = body.querySelector('.image-wrap');
        if(wrap){
            // 分组单图卡片含 16px 内边距（PAD=32），图片按内边距内的尺寸显示，避免溢出边框。
            const wrapW = isSmartGroupNode(node) ? Math.max(24, Number(layout.innerW || 0) || (Number(layout.width) - 32)) : layout.width;
            const wrapH = isSmartGroupNode(node) ? Math.max(24, Number(layout.innerH || 0) || (Number(layout.height) - 60)) : layout.height;
            wrap.style.setProperty('--node-img-w', `${wrapW}px`);
            wrap.style.setProperty('--node-img-h', `${wrapH}px`);
        }
        const media = body.querySelector('.node-img');
        if(media){
            const mediaW = isSmartGroupNode(node) ? Math.max(24, Number(layout.innerW || 0) || (Number(layout.width) - 32)) : layout.width;
            const mediaH = isSmartGroupNode(node) ? Math.max(24, Number(layout.innerH || 0) || (Number(layout.height) - 60)) : layout.height;
            media.style.width = `${mediaW}px`;
            media.style.height = `${mediaH}px`;
        }
    }
    const active = selectedNode();
    if(active?.id === node.id) positionComposerForNode(active);
    scheduleInteractionLayerRefresh();
}
function syncSmartGroupMemberElements(group){
    if(!isSmartGroupNode(group)) return;
    smartGroupCompactMembers(group).forEach(member => {
        const el = world.querySelector(`.image-node[data-id="${CSS.escape(member.id)}"]`);
        if(el){
            el.style.left = `${member.x || 0}px`;
            el.style.top = `${member.y || 0}px`;
        }
        updateNodeElementDuringResize(member);
    });
}
function isVideoMediaItem(img){
    if(!img) return false;
    if(img.kind === 'video') return true;
    const url = smartOriginalMediaUrl(img).toLowerCase();
    return /\.(mp4|webm|mov|m4v|avi|mkv)(\?|$)/.test(url);
}
function isInlineVideoActive(img){
    return Boolean(img && img._inlineVideoActive);
}
function isAudioMediaItem(img){
    if(!img) return false;
    if(img.kind === 'audio') return true;
    const url = smartOriginalMediaUrl(img).toLowerCase();
    return /\.(mp3|wav|m4a|aac|ogg|flac)(\?|$)/.test(url);
}
function isTextMediaItem(img){
    if(!img) return false;
    if(img.kind === 'text') return true;
    const url = smartOriginalMediaUrl(img).toLowerCase();
    return /\.(txt|json|csv|srt|vtt|md)(\?|$)/.test(url);
}
function isFileMediaItem(img){
    if(!img) return false;
    return img.kind === 'file';
}
function mediaKindForFile(file){
    const type = String(file?.type || '').toLowerCase();
    const name = String(file?.name || '').toLowerCase();
    if(type.startsWith('video/') || /\.(mp4|webm|mov|m4v|avi|mkv)(\?|$)/.test(name)) return 'video';
    if(type.startsWith('audio/') || /\.(mp3|wav|m4a|aac|ogg|flac)(\?|$)/.test(name)) return 'audio';
    if(type.startsWith('text/') || /\.(txt|json|csv|srt|vtt|md)(\?|$)/.test(name)) return 'text';
    return 'image';
}
function mediaKindForItem(img){
    if(isFileMediaItem(img)) return 'file';
    if(isTextMediaItem(img)) return 'text';
    if(isAudioMediaItem(img)) return 'audio';
    if(isVideoMediaItem(img)) return 'video';
    return 'image';
}
function localDisplayUrlForMediaItem(img){
    if(!img) return '';
    const candidates = [
        img.originalLocalUrl,
        img.localUrl,
        img.sourceUrl,
        img.local_url,
        img.source_url,
        img.url
    ];
    const local = candidates.find(url => url && !/^https?:\/\//i.test(String(url)));
    return local || img.url || '';
}
function imageForDisplay(img){
    if(!img || typeof img !== 'object') return img;
    const localUrl = localDisplayUrlForMediaItem(img);
    if(!localUrl || localUrl === img.url) return img;
    return {
        ...img,
        url:localUrl,
        originalLocalUrl:img.originalLocalUrl || localUrl
    };
}
function resultMediaUrls(result){
    const urls = [];
    const add = value => {
        if(!value) return;
        if(typeof value === 'string'){
            urls.push(value);
            return;
        }
        if(Array.isArray(value)){
            value.forEach(add);
            return;
        }
        if(typeof value === 'object'){
            if(value.url || value.path || value.src || value.uri){
                const url = value.url || value.path || value.src || value.uri;
                if(url){
                    const item = {url, kind:value.kind || value.type || value.mediaKind || '', name:value.name || value.filename || ''};
                    ['natural_w','natural_h','width','height','w','h','layout_w','layout_h'].forEach(key => {
                        const n = Number(value[key]);
                        if(Number.isFinite(n) && n > 0) item[key] = n;
                    });
                    urls.push(item);
                }
            }
            ['outputs','videos','images','urls','data','result'].forEach(key => add(value[key]));
            ['url','path','src','uri','output','output_url','outputUrl','video','video_url','videoUrl','mp4_url','mp4Url','download_url','downloadUrl','preview_url','previewUrl'].forEach(key => add(value[key]));
        }
    };
    add(result);
    ['items','outputs','videos','audios','texts','files','images','urls','data','result','output','url'].forEach(key => add(result?.[key]));
    const seen = new Set();
    return urls.map(item => {
        const url = typeof item === 'string' ? item : item?.url || item?.path || '';
        if(!url) return null;
        return typeof item === 'object' ? {...item, url} : url;
    }).filter(item => {
        const url = typeof item === 'string' ? item : item?.url || '';
        return url && !seen.has(url) && seen.add(url);
    });
}
function mediaKindForUrls(urls, fallback='image'){
    const items = (urls || []).map(item => typeof item === 'string' ? {url:item} : (item || {}));
    if(fallback && fallback !== 'image') return fallback;
    if(items.some(isVideoMediaItem)) return 'video';
    if(items.some(isAudioMediaItem)) return 'audio';
    if(items.some(isTextMediaItem)) return 'text';
    return fallback;
}
function imageRefsOnly(refs){
    return (refs || []).filter(ref => ref?.url && mediaKindForItem(ref) === 'image').slice(0, SMART_REFERENCE_IMAGE_MAX);
}
function looksLikeImageMediaUrl(url){
    const text = String(url || '').trim().toLowerCase();
    if(!text) return false;
    if(text.startsWith('data:image/')) return true;
    if(text.startsWith('asset://')) return false;
    const path = text.split('?', 1)[0].split('#', 1)[0];
    return /\.(png|jpe?g|webp|gif|bmp|tiff)$/i.test(path);
}
function videoRefsOnly(refs){
    return (refs || []).filter(ref => ref?.url && mediaKindForItem(ref) === 'video' && !looksLikeImageMediaUrl(ref.url));
}
function isRemoteVideoReferenceUrl(url){
    return /^https?:\/\//i.test(String(url || '')) || /^asset:\/\//i.test(String(url || ''));
}
function audioRefsOnly(refs){
    return (refs || []).filter(ref => ref?.url && mediaKindForItem(ref) === 'audio');
}
function thumbMediaHtml(img){
    if(isFileMediaItem(img) || isTextMediaItem(img)) return `<div class="media-thumb file-thumb" data-media-url="${escapeAttr(img.url || '')}" data-media-kind="${escapeAttr(mediaKindForItem(img))}"><i data-lucide="${isTextMediaItem(img) ? 'file-text' : 'file'}"></i><span>${escapeHtml(img.name || (isTextMediaItem(img) ? 'Text' : 'File'))}</span></div>`;
    if(isAudioMediaItem(img)) return `<div class="media-thumb audio-thumb" data-media-url="${escapeAttr(img.url || '')}" data-media-kind="audio"><i data-lucide="file-audio"></i><span>${escapeHtml(img.name || 'Audio')}</span></div>`;
    if(isVideoMediaItem(img)) return `<div class="media-thumb video-thumb">${isInlineVideoActive(img) ? smartVideoPlayerHtml(img.url || '') : `${smartVideoPreviewHtml(img, 512, 'alt=""')}<button class="smart-video-play thumb-video-play" type="button" title="播放"><i data-lucide="play"></i></button>`}</div>`;
    return smartPreviewImgHtml(img, 512, 'draggable="false"');
}
function imageResolutionLabel(img){
    const w = Number(img?.natural_w || img?.width || img?.w || 0);
    const h = Number(img?.natural_h || img?.height || img?.h || 0);
    return w > 0 && h > 0 ? `${Math.round(w)} x ${Math.round(h)}` : '';
}
function imageResolutionBadgeHtml(img){
    const label = imageResolutionLabel(img);
    return label ? `<span class="image-resolution-badge">${escapeHtml(label)}</span>` : '';
}
function thumbDisplaySize(img, maxSize){
    const limit = Math.max(28, Math.round(Number(maxSize) || 96));
    const size = mediaLayoutSize(img);
    const w = size.width;
    const h = size.height;
    if(!(w > 0 && h > 0)) return {width:limit, height:limit};
    const fit = Math.min(limit / w, limit / h);
    return {
        width:Math.max(28, Math.round(w * fit)),
        height:Math.max(28, Math.round(h * fit))
    };
}
function thumbItemStyle(img, maxSize){
    const size = thumbDisplaySize(img, maxSize);
    return `--thumb-w:${size.width}px;--thumb-h:${size.height}px`;
}
function applyThumbDisplaySizeToElement(itemEl, img, maxSize=0){
    if(!itemEl?.classList?.contains('thumb-item')) return;
    const limit = Math.max(
        28,
        Math.round(
            Number(maxSize || 0)
            || Number(itemEl.style.getPropertyValue('--thumb-size').replace('px', ''))
            || Math.max(itemEl.clientWidth || 0, itemEl.clientHeight || 0)
            || 96
        )
    );
    const size = thumbDisplaySize(img, limit);
    itemEl.style.setProperty('--thumb-w', `${size.width}px`);
    itemEl.style.setProperty('--thumb-h', `${size.height}px`);
}
function updateImageResolutionBadgeElement(itemEl, img){
    if(!itemEl) return;
    const label = imageResolutionLabel(img);
    let badge = itemEl.querySelector('.image-resolution-badge');
    if(!label){
        badge?.remove();
        return;
    }
    if(!badge){
        badge = document.createElement('span');
        badge.className = 'image-resolution-badge';
        itemEl.appendChild(badge);
    }
    badge.textContent = label;
}
function singleMediaHtml(img, w, h){
    if(isFileMediaItem(img) || isTextMediaItem(img)) return `<div class="node-img media-card media-file-card" style="width:${w}px;height:${h}px"><div class="media-card-icon"><i data-lucide="${isTextMediaItem(img) ? 'file-text' : 'file'}"></i></div><div class="media-card-title">${escapeHtml(img.name || (isTextMediaItem(img) ? 'Text' : 'File'))}</div><div class="media-card-sub">${isTextMediaItem(img) ? 'TEXT' : 'FILE'}</div></div>`;
    if(isAudioMediaItem(img)) return `<div class="node-img media-card media-audio-card" style="width:${w}px;height:${h}px"><div class="media-card-icon"><i data-lucide="file-audio"></i></div><div class="media-card-title">${escapeHtml(img.name || 'Audio')}</div><div class="media-card-sub">AUDIO</div><audio src="${escapeAttr(img.url || '')}" data-url="${escapeAttr(img.url || '')}" controls preload="metadata"></audio></div>`;
    if(isVideoMediaItem(img)) return `<div class="node-img media-card media-video-card" style="width:${w}px;height:${h}px">${isInlineVideoActive(img) ? smartVideoPlayerHtml(img.url || '') : `${smartVideoPreviewHtml(img, 768, 'alt=""')}<button class="smart-video-play" type="button" title="播放"><i data-lucide="play"></i></button>`}</div>`;
    return smartPreviewImgHtml(img, 768, `class="node-img" draggable="false" style="width:${w}px;height:${h}px"`);
}
function smartNodeHasLiveMedia(node){
    return Boolean(!node?.pending && (node?.images || []).some(img => img?.url));
}
function mediaSignaturePartFromElement(itemEl){
    if(itemEl?.dataset?.mediaSignature) return itemEl.dataset.mediaSignature;
    const media = itemEl?.querySelector?.('video,audio,img');
    if(media){
        const tag = media.tagName.toLowerCase();
        const kind = tag === 'video' ? 'video' : tag === 'audio' ? 'audio' : 'image';
        const url = media.dataset?.url || media.dataset?.originalSrc || media.getAttribute('src') || '';
        return `${kind}:${url}`;
    }
    const audioThumb = itemEl?.querySelector?.('.audio-thumb[data-media-url]');
    if(audioThumb) return `audio:${audioThumb.dataset.mediaUrl || ''}`;
    return '';
}
function captureMediaPlaybackState(media){
    if(!media) return null;
    return {
        currentTime:Number.isFinite(media.currentTime) ? media.currentTime : 0,
        paused:Boolean(media.paused),
        playbackRate:Number.isFinite(media.playbackRate) ? media.playbackRate : 1,
        muted:Boolean(media.muted),
        volume:Number.isFinite(media.volume) ? media.volume : 1
    };
}
function restoreMediaPlaybackState(media, state){
    if(!media || !state) return;
    try { media.playbackRate = state.playbackRate || 1; } catch(e) {}
    try { media.muted = state.muted; } catch(e) {}
    try { media.volume = state.volume; } catch(e) {}
    const applyTime = () => {
        if(Number.isFinite(state.currentTime) && state.currentTime > 0 && Math.abs((media.currentTime || 0) - state.currentTime) > 0.2){
            try { media.currentTime = state.currentTime; } catch(e) {}
        }
        if(!state.paused && typeof media.play === 'function'){
            const playPromise = media.play();
            if(playPromise?.catch) playPromise.catch(() => {});
        }
    };
    if(media.readyState >= 1) applyTime();
    else media.addEventListener('loadedmetadata', applyTime, {once:true});
}
function transplantSmartMediaElements(oldNodeEl, newNodeEl){
    const oldItems = [...(oldNodeEl?.querySelectorAll?.('.thumb-item,.image-wrap') || [])];
    const newItems = [...(newNodeEl?.querySelectorAll?.('.thumb-item,.image-wrap') || [])];
    oldItems.forEach((oldItem, index) => {
        const oldMedia = oldItem.querySelector('video,audio,img.node-img,.thumb-item > img,.media-thumb img');
        if(!oldMedia) return;
        const selector = oldMedia.tagName.toLowerCase();
        const oldUrl = oldMedia.dataset?.url || oldMedia.dataset?.originalSrc || oldMedia.getAttribute('src') || '';
        const oldSignature = oldItem.dataset?.mediaSignature || `${selector}:${oldUrl}`;
        const newItem = newItems.find(item => item.dataset?.mediaSignature === oldSignature)
            || newItems.find(item => item.querySelector?.(selector)?.dataset?.url === oldUrl)
            || newItems.find(item => item.querySelector?.(selector)?.dataset?.originalSrc === oldUrl)
            || newItems.find(item => item.querySelector?.(selector)?.getAttribute?.('src') === oldMedia.getAttribute('src'))
            || newItems[index];
        const newMedia = newItem?.querySelector?.(selector);
        const newUrl = newMedia?.dataset?.url || newMedia?.dataset?.originalSrc || newMedia?.getAttribute?.('src') || '';
        if(!newMedia || oldUrl !== newUrl) return;
        if(selector === 'img'){
            oldMedia.className = newMedia.className;
            oldMedia.draggable = false;
            oldMedia.alt = newMedia.getAttribute('alt') || oldMedia.getAttribute('alt') || '';
            oldMedia.style.cssText = newMedia.style.cssText;
            oldMedia.dataset.originalSrc = newMedia.dataset?.originalSrc || oldMedia.dataset?.originalSrc || '';
            newMedia.replaceWith(oldMedia);
            return;
        }
        const state = captureMediaPlaybackState(oldMedia);
        newMedia.replaceWith(oldMedia);
        restoreMediaPlaybackState(oldMedia, state);
        requestAnimationFrame(() => restoreMediaPlaybackState(oldMedia, state));
    });
}
function captureMediaPlaybackStates(){
    const states = new Map();
    world.querySelectorAll('video[data-url], audio[data-url]').forEach(media => {
        const tag = media.tagName.toLowerCase();
        const url = media.dataset.url || media.getAttribute('src') || '';
        if(url) states.set(`${tag}:${url}`, captureMediaPlaybackState(media));
    });
    return states;
}
function restoreMediaPlaybackStates(states){
    if(!states?.size) return;
    world.querySelectorAll('video[data-url], audio[data-url]').forEach(media => {
        const tag = media.tagName.toLowerCase();
        const url = media.dataset.url || media.getAttribute('src') || '';
        restoreMediaPlaybackState(media, states.get(`${tag}:${url}`));
    });
}
function smartRunTaskLabel(run){
    const s = run?.settings || {};
    if(run?.kind === 'video') return s.videoModel || 'Video';
    if(s.engine === 'modelscope'){
        return s.msgenModel === 'custom' ? (s.msCustomModel || 'Modelscope') : (MS_GEN_MODELS[s.msgenModel]?.label || s.msgenModel || 'Modelscope');
    }
    return s.model || 'API Image';
}
function outputUrlLooksVideo(url){
    return /\.(mp4|webm|mov|m4v|avi|mkv)(\?|$)/.test(smartOriginalMediaUrl(url).toLowerCase());
}
function proxiedMediaUrl(itemOrUrl, name=''){
    const url = smartOriginalMediaUrl(itemOrUrl);
    if(!url || String(url).startsWith('/assets/') || String(url).startsWith('/output/') || String(url).startsWith('data:') || String(url).startsWith('blob:')) return url;
    const filename = name || (typeof itemOrUrl === 'object' ? (itemOrUrl.name || '') : '') || fileNameFromUrl(url) || 'preview';
    return `/api/download-output?inline=1&url=${encodeURIComponent(url)}&name=${encodeURIComponent(filename)}`;
}
function displayMediaUrl(itemOrUrl, name=''){
    const url = smartOriginalMediaUrl(itemOrUrl);
    if(/^https?:\/\//i.test(String(url || ''))) return proxiedMediaUrl(itemOrUrl, name);
    return url;
}
function bindImageProxyFallback(imgEl, itemOrUrl){
    if(!imgEl || imgEl.dataset.proxyFallbackBound === '1') return;
    imgEl.dataset.proxyFallbackBound = '1';
    imgEl.addEventListener('error', () => {
        if(imgEl.dataset.proxyFallbackTried === '1') return;
        const fallback = proxiedMediaUrl(itemOrUrl);
        if(!fallback || fallback === imgEl.getAttribute('src')) return;
        imgEl.dataset.proxyFallbackTried = '1';
        imgEl.src = fallback;
    });
}
function safeExportFileName(name, fallback='download.zip'){
    const cleaned = String(name || fallback).replace(/[\\/:*?"<>|]+/g, '_').trim();
    return cleaned || fallback;
}
function fileNameFromUrl(url=''){
    try {
        const parsed = new URL(String(url || ''), window.location.href);
        return decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || '');
    } catch(e) {
        return decodeURIComponent(String(url || '').split('?')[0].split('#')[0].split('/').filter(Boolean).pop() || '');
    }
}
function extensionForMediaItem(item, fallback='.png'){
    const source = [item?.name, item?.url].map(value => String(value || '').split('?')[0].split('#')[0]).find(value => /\.[a-z0-9]{2,8}$/i.test(value));
    if(source) return source.match(/(\.[a-z0-9]{2,8})$/i)?.[1] || fallback;
    const kind = mediaKindForItem(item);
    if(kind === 'video') return '.mp4';
    if(kind === 'audio') return '.mp3';
    if(kind === 'text') return '.txt';
    return fallback;
}
function downloadNameForMediaItem(item, fallbackPrefix='canvas-output'){
    const localName = fileNameFromUrl(item?.url || '');
    const preferred = localName || item?.name || '';
    const ext = extensionForMediaItem(item);
    const randomName = `${fallbackPrefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}${ext}`;
    let name = safeExportFileName(preferred || randomName, randomName);
    if(!/\.[a-z0-9]{2,8}$/i.test(name)) name += ext;
    return name;
}
function downloadPreviewImage(){
    const node = nodes.find(n => n.id === previewNavState.nodeId);
    const image = node?.images?.[previewNavState.index];
    if(!image?.url) return;
    const name = downloadNameForMediaItem(image, 'image');
    const link = document.createElement('a');
    link.href = `/api/download-output?url=${encodeURIComponent(image.url)}&name=${encodeURIComponent(name)}`;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
}
function downloadPreviewFile(item){
    if(!item?.url) return;
    const name = downloadNameForMediaItem(item, 'output');
    const link = document.createElement('a');
    link.href = `/api/download-output?url=${encodeURIComponent(item.url)}&name=${encodeURIComponent(name)}`;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
}
function previewDownloadGroupItems(){
    // 分组预览：整组所有成员图片按阅读顺序打包。
    if(previewNavState.groupId){
        const group = nodes.find(n => n.id === previewNavState.groupId && isSmartGroupNode(n));
        if(group) return smartGroupImageRefs(group).map((r, index) => ({...r.item, __index:index}));
    }
    const node = nodes.find(n => n.id === previewNavState.nodeId);
    return (node?.images || [])
        .filter(item => item?.url)
        .map((item, index) => ({...item, __index:index}))
        .sort((a, b) => {
            const ga = a.grid || {};
            const gb = b.grid || {};
            const rowDiff = Number(ga.row ?? a.__index) - Number(gb.row ?? b.__index);
            if(rowDiff) return rowDiff;
            const colDiff = Number(ga.col ?? a.__index) - Number(gb.col ?? b.__index);
            return colDiff || a.__index - b.__index;
        });
}
// 把一组图片打包成 zip 下载（预览“下载全部”和分组小菜单“批量下载”共用）。
async function zipDownloadImageItems(title, items){
    const list = (items || []).filter(item => item?.url);
    if(!list.length) return;
    try {
        const filename = safeExportFileName(`${title || 'image-group'}.zip`, 'image-group.zip');
        const response = await fetch('/api/canvas-assets/download', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                filename,
                urls:list.map(item => item.url).filter(Boolean),
                items:list.map((item, index) => ({url:item.url, name:downloadNameForMediaItem(item, `image-${String(index + 1).padStart(2, '0')}`)}))
            })
        });
        if(!response.ok) throw new Error((await response.text()) || '批量下载失败');
        const blob = await response.blob();
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(href), 1200);
    } catch(e) {
        toast((e.message || '批量下载失败').slice(0, 160));
    }
}
async function downloadPreviewGroup(){
    const group = previewNavState.groupId ? nodes.find(n => n.id === previewNavState.groupId) : null;
    const owner = group || nodes.find(n => n.id === previewNavState.nodeId);
    return zipDownloadImageItems(owner?.title, previewDownloadGroupItems());
}
function downloadSmartGroupImages(group){
    if(!isSmartGroupNode(group)) return;
    return zipDownloadImageItems(group?.title, smartGroupImageRefs(group).map(r => r.item));
}
function smartRunPlatformLabel(run){
    const s = run?.settings || {};
    if(s.engine === 'modelscope') return 'Modelscope';
    if(run?.kind === 'video') return videoProviderById(s.videoProvider || '')?.name || s.videoProvider || 'Video';
    return apiProviderById(s.provider_id || '')?.name || s.provider_id || 'API';
}
function smartRunRequestMeta(run){
    const s = run?.settings || {};
    if(s.engine === 'modelscope') return {backend:'Modelscope', model:s.msgenModel || '', custom_model:s.msCustomModel || ''};
    if(run?.kind === 'video') return {provider_id:s.videoProvider || '', model:s.videoModel || '', duration:s.videoDuration || '', aspect_ratio:s.videoAspect || '', resolution:s.videoResolution || ''};
    return {provider_id:s.provider_id || '', model:s.model || '', size:run?.size || '', quality:s.quality || '', n:s.count || 1};
}
function smartRunSnapshot(node, prompt, refs=[], kind='image'){
    const settingsSnapshot = cloneSmartSettings(settings);
    return {
        nodeId:node?.id || '',
        nodeType:node?.type || 'smart-image',
        kind,
        settings:settingsSnapshot,
        prompt:prompt || '',
        refs:(refs || []).map(ref => ({
            url:ref.url || '',
            name:ref.name || 'image',
            kind:ref.kind || '',
            role:ref.role || '',
            roleLabel:smartReferenceRoleLabel(ref),
            upload:smartReferenceUploadAllowed(ref),
            weight:smartReferenceRoleWeight(ref)
        })).filter(ref => ref.url),
        trace:smartBuildGenerationTrace({node, prompt, refs, runSettings:settingsSnapshot, kind}),
        size: kind === 'image' && isApiLikeEngine(settingsSnapshot.engine) ? sizeForRun(settingsSnapshot) : ''
    };
}
function addSmartGenerationLog({run, outputs=[], runMs=0, error=''}) {
    if(!canvas) return;
    canvas.logs = canvas.logs || [];
    const outputUrls = resultMediaUrls(outputs).map(item => typeof item === 'string' ? item : item?.url || '').filter(Boolean);
    const entry = {
        id:uid('log'),
        createdAt:Date.now(),
        status:error ? 'failed' : 'success',
        platform:smartRunPlatformLabel(run),
        nodeId:run?.nodeId || '',
        nodeType:run?.nodeType || 'smart-image',
        model:smartRunTaskLabel(run),
        request:smartRunRequestMeta(run),
        prompt:run?.prompt || '',
        outputs:outputUrls,
        refs:run?.refs || [],
        trace:run?.trace || null,
        runMs:Number(runMs || 0),
        error:error ? String(error) : ''
    };
    canvas.logs = [entry, ...canvas.logs].slice(0, 500);
    if(!error && recoverStuckLoopOutputsFromLogs()) render();
    scheduleSave();
}
const SMART_LOG_PREVIEW_NODE_ID = '__smart_log_preview__';
let smartLogPreviewRestore = null;
// 移除临时预览节点并还原选中态。供 closeImageEditor 调用。
function cleanupSmartLogPreviewNode(){
    if(nodes.some(n => n.id === SMART_LOG_PREVIEW_NODE_ID)) nodes = nodes.filter(n => n.id !== SMART_LOG_PREVIEW_NODE_ID);
    if(smartLogPreviewRestore){
        selectedId = smartLogPreviewRestore.selectedId;
        selectedImage = smartLogPreviewRestore.selectedImage;
        smartLogPreviewRestore = null;
    }
}
function closeSmartLogLightbox(){
    const box = document.getElementById('smartLogLightbox');
    if(!box) return;
    box.classList.remove('open');
    const img = box.querySelector('img');
    if(img){ img.onerror = null; img.removeAttribute('src'); }
}
// 日志缩略图的轻量预览：只弹一张大图（不进编辑器那套裁剪/涂抹的重组件），点背景或关闭按钮即关。
function openSmartLogLightbox(url, kind='image'){
    if(!url) return;
    if(kind === 'video' || outputUrlLooksVideo(url)){ window.open(displayMediaUrl({url}), '_blank'); return; }
    let box = document.getElementById('smartLogLightbox');
    if(!box){
        box = document.createElement('div');
        box.id = 'smartLogLightbox';
        box.className = 'smart-log-lightbox';
        box.innerHTML = `<img alt="preview" draggable="false"><button class="smart-log-lightbox-close" type="button" aria-label="${escapeAttr(tr('common.close') || '关闭')}"><i data-lucide="x"></i></button>`;
        document.body.appendChild(box);
        box.addEventListener('click', e => {
            if(e.target === box || e.target.closest('.smart-log-lightbox-close')) closeSmartLogLightbox();
        });
    }
    const img = box.querySelector('img');
    // 原图加载失败时回退到缩略图同款的 media-preview 代理（PIL 渲染，对截断文件更宽容）。
    let triedFallback = false;
    img.onerror = () => {
        if(triedFallback) return;
        triedFallback = true;
        const fb = smartMediaPreviewUrl({url}, 2048);
        if(fb && fb !== img.getAttribute('src')) img.src = fb;
    };
    img.src = displayMediaUrl({url});
    box.classList.add('open');
    refreshIcons();
}
function smartLogPreviewNode(url, kind='image'){
    openSmartLogLightbox(url, kind);
}
function renderSmartCanvasLog(){
    const logs = canvas?.logs || [];
    smartLogList.innerHTML = logs.length ? logs.map(log => {
        const thumbs = (log.outputs || []).slice(0, 8).map(url => {
            const safe = escapeAttr(url);
            const kind = outputUrlLooksVideo(url) ? 'video' : 'image';
            return kind === 'video' ? smartVideoPreviewHtml(url, 256, `data-url="${safe}" data-kind="video" alt="output"`) : smartPreviewImgHtml(url, 256, `data-url="${safe}" data-kind="image" alt="output"`);
        }).join('');
        const date = new Date(log.createdAt || Date.now()).toLocaleString(window.StudioI18n?.lang() === 'en' ? 'en-US' : 'zh-CN');
        const req = log.request || {};
        const taskId = req.task_id || req.taskId || req.prompt_id || req.promptId || '';
        const backend = req.provider_id || req.providerId || req.backend || '';
        const subParts = [
            date,
            `${window.StudioI18n?.lang() === 'en' ? 'outputs' : '输出'} ${(log.outputs || []).length}`,
            taskId ? `ID ${taskId}` : '',
            backend
        ].filter(Boolean);
        const trace = log.trace || null;
        const traceText = trace ? smartTraceSummary(trace) : '';
        const traceRefs = trace?.references?.length
            ? trace.references.slice(0, 8).map(ref => `${ref.index}.${ref.roleLabel}${ref.upload ? '' : '(\u4e0d\u4e0a\u4f20)'}`).join('  ')
            : '';
        return `<div class="log-item ${log.status === 'failed' ? 'failed' : ''}">
            <div class="log-main">
                <div class="log-meta">
                    <span class="log-chip ${log.status === 'failed' ? 'status-failed' : 'status-ok'}">${escapeHtml(log.status === 'failed' ? tr('canvas.failed') : tr('canvas.success'))}</span>
                    <span class="log-chip">${escapeHtml(log.platform || '-')}</span>
                    ${log.model ? `<span class="log-chip">${escapeHtml(log.model)}</span>` : ''}
                    <span class="log-chip">${escapeHtml(formatRunDuration(log.runMs || 0))}</span>
                </div>
                <div class="log-subline">${subParts.map(part => `<span title="${escapeAttr(part)}">${escapeHtml(part)}</span>`).join('')}</div>
                ${traceText ? `<div class="log-trace" title="${escapeAttr([traceText, traceRefs].filter(Boolean).join('\n'))}" data-trace="${escapeAttr(JSON.stringify(trace || {}))}"><i data-lucide="scan-search"></i><span>${escapeHtml(traceText)}</span>${traceRefs ? `<small>${escapeHtml(traceRefs)}</small>` : ''}</div>` : ''}
                ${log.error ? `<div class="log-error" title="${escapeAttr(log.error)}" data-error="${escapeAttr(log.error)}">${escapeHtml(log.error)}</div>` : ''}
                <div class="log-prompt" title="${escapeAttr(log.prompt || tr('canvas.noPromptMeta'))}" data-prompt="${escapeAttr(log.prompt || '')}">${escapeHtml(log.prompt || tr('canvas.noPromptMeta'))}</div>
            </div>
            <div class="log-thumbs">${thumbs}</div>
        </div>`;
    }).join('') : `<div class="log-empty">${escapeHtml(tr('canvas.noLogs'))}</div>`;
    bindSmartPreviewImageFallbacks(smartLogList);
    smartLogList.querySelectorAll('[data-url]').forEach(el => {
        el.onclick = e => {
            e.stopPropagation();
            smartLogPreviewNode(el.dataset.url, el.dataset.kind || 'image');
        };
    });
    const bindLogCopy = (selector, key) => {
        smartLogList.querySelectorAll(selector).forEach(el => {
            el.onclick = e => {
                e.stopPropagation();
                const text = el.dataset[key] || '';
                if(text) navigator.clipboard?.writeText(text).catch(() => {});
                const oldText = el.textContent;
                el.textContent = tr('canvas.copied');
                el.classList.add('copied');
                setTimeout(() => {
                    el.textContent = oldText;
                    el.classList.remove('copied');
                }, 900);
            };
        });
    };
    bindLogCopy('[data-prompt]', 'prompt');
    bindLogCopy('[data-error]', 'error');
    refreshIcons();
}
function openSmartCanvasLog(){
    if(!canvas) return;
    renderSmartCanvasLog();
    smartLogModal.classList.add('open');
}
function closeSmartCanvasLog(){
    smartLogModal.classList.remove('open');
}
function openSmartCanvasShortcuts(){
    smartShortcutModal?.classList.add('open');
    refreshIcons();
}
function closeSmartCanvasShortcuts(){
    smartShortcutModal?.classList.remove('open');
}
function promptNodeReferenceWeightHtml(node){
    if(!node?.styleMatch) return '';
    const weight = promptNodeReferenceWeight(node);
    return `<label class="prompt-style-weight prompt-node-control">
        <span><i data-lucide="sliders-horizontal"></i>原图参考权重</span>
        <input class="prompt-style-weight-range" type="range" min="0" max="100" step="5" value="${weight}">
        <strong class="prompt-style-weight-value">${weight}%</strong>
    </label>`;
}
function promptCameraRigStyle(node){
    const azimuthPoint = promptCameraAzimuthGeometry(promptNodeCameraAzimuth(node).value);
    const elevationPoint = promptCameraElevationGeometry(promptNodeCameraElevation(node).value);
    return `--yaw-x:${azimuthPoint.x};--yaw-y:${azimuthPoint.y};--pitch-y:${elevationPoint.y};`;
}
function promptNodeCameraRigHtml(node){
    const azimuth = promptNodeCameraAzimuth(node);
    const elevation = promptNodeCameraElevation(node);
    return `<div class="prompt-camera-rig" style="${promptCameraRigStyle(node)}">
        <div class="prompt-camera-yaw-pad" data-camera-yaw title="Drag the handle to rotate horizontal camera view">
            <span class="prompt-camera-orbit"></span>
            <span class="prompt-camera-axis prompt-camera-axis-x"></span>
            <span class="prompt-camera-axis prompt-camera-axis-y"></span>
            <span class="prompt-camera-depth-arc"></span>
            <span class="prompt-camera-center-dot"></span>
            <span class="prompt-camera-axis-label yaw-front">&#27491;</span>
            <span class="prompt-camera-axis-label yaw-back">&#32972;</span>
            <span class="prompt-camera-axis-label yaw-left">&#24038;</span>
            <span class="prompt-camera-axis-label yaw-right">&#21491;</span>
            <button class="prompt-camera-yaw-handle" type="button" data-camera-yaw-handle aria-label="Horizontal camera angle" title="${escapeAttr(azimuth.label)}"><span></span></button>
        </div>
        <div class="prompt-camera-pitch-rail" data-camera-pitch title="Drag the handle to set camera height">
            <span class="prompt-camera-pitch-line"></span>
            <span class="prompt-camera-pitch-tick top"></span>
            <span class="prompt-camera-pitch-tick middle"></span>
            <span class="prompt-camera-pitch-tick bottom"></span>
            <span class="prompt-camera-pitch-label top">&#39640;</span>
            <span class="prompt-camera-pitch-label middle">&#24179;</span>
            <span class="prompt-camera-pitch-label bottom">&#20302;</span>
            <button class="prompt-camera-pitch-handle" type="button" data-camera-pitch-handle aria-label="Camera height angle" title="${escapeAttr(elevation.label)}"><span></span></button>
        </div>
        <div class="prompt-camera-readout">
            <span><small>&#26041;&#21521;</small><strong class="prompt-camera-azimuth-label">${escapeHtml(azimuth.label)}</strong></span>
            <span><small>&#39640;&#24230;</small><strong class="prompt-camera-elevation-label">${escapeHtml(elevation.label)}</strong></span>
        </div>
    </div>`;
}
function promptNodeCameraControlHtml(node){
    if(!promptNodeCameraEnabled(node)) return '';
    const focal = promptNodeCameraFocalLength(node);
    const lens = promptNodeCameraLensInfo(focal);
    return `<div class="prompt-camera-panel prompt-node-control">
        <div class="prompt-camera-head">
            <span><i data-lucide="camera"></i>相机控制</span>
            <strong class="prompt-camera-digest">${escapeHtml(promptNodeCameraSummary(node))}</strong>
        </div>
        <label class="prompt-camera-range">
            <span>焦段</span>
            <input class="prompt-camera-focal" type="range" min="${PROMPT_CAMERA_FOCAL_MIN}" max="${PROMPT_CAMERA_FOCAL_MAX}" step="1" value="${focal}">
            <strong class="prompt-camera-focal-value">${focal}mm</strong>
        </label>
        ${promptNodeCameraRigHtml(node)}
        <div class="prompt-camera-note">${escapeHtml(`${lens.label} · 约 ${lens.fov}° FOV · ${lens.note}`)}</div>
    </div>`;
}
function refreshPromptCameraControlUi(el, node){
    const focal = promptNodeCameraFocalLength(node);
    const lens = promptNodeCameraLensInfo(focal);
    const digestEl = el.querySelector('.prompt-camera-digest');
    const focalValueEl = el.querySelector('.prompt-camera-focal-value');
    const noteEl = el.querySelector('.prompt-camera-note');
    const rigEl = el.querySelector('.prompt-camera-rig');
    const azimuthLabelEl = el.querySelector('.prompt-camera-azimuth-label');
    const elevationLabelEl = el.querySelector('.prompt-camera-elevation-label');
    const yawHandleEl = el.querySelector('.prompt-camera-yaw-handle');
    const pitchHandleEl = el.querySelector('.prompt-camera-pitch-handle');
    const azimuth = promptNodeCameraAzimuth(node);
    const elevation = promptNodeCameraElevation(node);
    if(digestEl) digestEl.textContent = promptNodeCameraSummary(node);
    if(focalValueEl) focalValueEl.textContent = `${focal}mm`;
    if(noteEl) noteEl.textContent = `${lens.label} · 约 ${lens.fov}° FOV · ${lens.note}`;
    if(rigEl) rigEl.setAttribute('style', promptCameraRigStyle(node));
    if(azimuthLabelEl) azimuthLabelEl.textContent = azimuth.label;
    if(elevationLabelEl) elevationLabelEl.textContent = elevation.label;
    if(yawHandleEl) yawHandleEl.title = azimuth.label;
    if(pitchHandleEl) pitchHandleEl.title = elevation.label;
    refreshPromptNodeSegmentsUi(el, node);
}
function syncPromptNodeHeightForCamera(node, prevExtra=0){
    if(!node) return;
    const nextExtra = promptNodeCameraExtraHeight(node);
    const explicitH = Number(node.h);
    const currentH = Number.isFinite(explicitH) ? explicitH : 0;
    const fallbackH = promptNodeMinHeight(node);
    node.h = Math.max(fallbackH, currentH ? currentH - Math.max(0, prevExtra) + nextExtra : fallbackH);
    node.w = Math.max(Number(node.w) || 0, 316);
}
function promptCameraYawPointFromEvent(target, event){
    const rect = target.getBoundingClientRect();
    const radius = Math.max(1, Math.min(rect.width, rect.height) * 0.36);
    return {
        x:promptCameraClampUnit((event.clientX - (rect.left + rect.width / 2)) / radius),
        y:promptCameraClampUnit((event.clientY - (rect.top + rect.height / 2)) / radius)
    };
}
function promptCameraPitchYFromEvent(target, event){
    const rect = target.getBoundingClientRect();
    const radius = Math.max(1, rect.height * 0.38);
    return promptCameraClampUnit((event.clientY - (rect.top + rect.height / 2)) / radius);
}
function bindPromptCameraDragControl(target, applyValue){
    if(!target) return;
    let dragging = false;
    ['mousedown', 'click', 'dblclick'].forEach(type => {
        target.addEventListener(type, event => {
            event.stopPropagation();
        }, true);
    });
    target.addEventListener('pointerdown', event => {
        if(event.button !== undefined && event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        dragging = true;
        target.classList.add('dragging');
        target.setPointerCapture?.(event.pointerId);
        applyValue(event);
    });
    target.addEventListener('pointermove', event => {
        if(!dragging) return;
        event.preventDefault();
        event.stopPropagation();
        applyValue(event);
    });
    const endDrag = event => {
        if(!dragging) return;
        event.preventDefault?.();
        event.stopPropagation?.();
        dragging = false;
        target.classList.remove('dragging');
        target.releasePointerCapture?.(event.pointerId);
        scheduleSave();
    };
    target.addEventListener('pointerup', endDrag);
    target.addEventListener('pointercancel', endDrag);
}
function bindPromptCameraRig(el, node){
    const yawEl = el.querySelector('[data-camera-yaw]');
    const pitchEl = el.querySelector('[data-camera-pitch]');
    bindPromptCameraDragControl(yawEl, event => {
        const point = promptCameraYawPointFromEvent(yawEl, event);
        const next = promptCameraNearestAzimuth(point.x, point.y);
        if(node.cameraAzimuth !== next.value){
            node.cameraAzimuth = next.value;
            refreshPromptCameraControlUi(el, node);
        }
    });
    bindPromptCameraDragControl(pitchEl, event => {
        const next = promptCameraNearestElevation(promptCameraPitchYFromEvent(pitchEl, event));
        if(node.cameraElevation !== next.value){
            node.cameraElevation = next.value;
            refreshPromptCameraControlUi(el, node);
        }
    });
}
function promptNodeBodyHtml(node){
    node.llmProvider = resolveChatProviderId(node.llmProvider || '');
    node.llmModel = resolveChatModel(node.llmModel || '', node.llmProvider);
    node.llmSystemEnabled = node.llmSystemEnabled === true;
    node.promptSplitEnabled = node.promptSplitEnabled === true;
    node.cameraEnabled = node.cameraEnabled === true;
    node.promptSeparator = promptNodeSeparator(node);
    const systemPrompt = (node.llmSystemPrompt || '').trim();
    const inputThumbs = smartNodeInputThumbsHtml(promptNodeInputImages(node));
    const templateActive = activePromptTemplateNodeId() === node.id;
    const referenceWeightHtml = promptNodeReferenceWeightHtml(node);
    const cameraControlHtml = promptNodeCameraControlHtml(node);
    const promptItems = promptNodePromptItems(node);
    const promptSplitPreviewH = promptNodeSplitPreviewHeight(node);
    const upstreamPromptItems = promptNodeUpstreamPromptItems(node);
    const upstreamPromptHtml = upstreamPromptItems.length ? `<div class="prompt-node-upstream">
        <div class="prompt-node-section-title">上游输入</div>
        <div class="prompt-node-upstream-list">${upstreamPromptItems.map((item, index) => `<div class="prompt-node-segment"><span>${index + 1}</span><p>${escapeHtml(item)}</p></div>`).join('')}</div>
    </div>` : '';
    const showLlmSystemControls = !node.styleMatch;
    const llmSystemToggleHtml = showLlmSystemControls
        ? `<button class="prompt-node-pill prompt-node-control prompt-system-toggle ${node.llmSystemEnabled ? 'active' : ''}" type="button"><i data-lucide="${node.llmSystemEnabled ? 'toggle-right' : 'toggle-left'}"></i><span>${escapeHtml(node.llmSystemEnabled ? tr('smart.promptLlmDisableSystem') : tr('smart.promptLlmEnableSystem'))}</span></button>`
        : '';
    const llmSystemPromptHtml = showLlmSystemControls && node.llmSystemEnabled
        ? `<textarea class="prompt-node-control prompt-llm-system" placeholder="${escapeHtml(tr('smart.promptLlmSystemPlaceholder'))}">${escapeHtml(systemPrompt || 'You are a helpful prompt assistant.')}</textarea>`
        : '';
    const llmParams = node.llmEnabled ? `
        <div class="prompt-node-llm">
            <select class="prompt-node-control prompt-llm-provider">${chatProviderOptions(node.llmProvider)}</select>
            <select class="prompt-node-control prompt-llm-model">${chatModelOptions(node.llmModel, node.llmProvider)}</select>
            <div class="prompt-llm-instruction-wrap">
                <textarea class="prompt-node-control prompt-llm-instruction" placeholder="${escapeHtml(tr('smart.promptLlmInstructionPlaceholder'))}" style="height:${promptLlmInstructionHeight(node)}px">${escapeHtml(node.llmInstruction || '')}</textarea>
                <div class="prompt-llm-instruction-resize prompt-node-control" data-llm-instruction-resize="1" title="拖动调整高度"><span></span></div>
            </div>
            ${upstreamPromptHtml}
            <div class="prompt-node-llm-actions">
                <button class="prompt-node-run prompt-node-control" type="button" ${node.running ? 'disabled' : ''}><i data-lucide="${node.running ? 'loader-2' : 'play'}"></i><span>${node.running ? escapeHtml(tr('common.running')) : escapeHtml(tr('common.run'))}</span></button>
                ${llmSystemToggleHtml}
            </div>
            ${llmSystemPromptHtml}
        </div>` : '';
    return `<div class="prompt-node-card">
        <textarea class="prompt-node-text prompt-node-control" placeholder="${escapeHtml(tr('smart.promptPlaceholderNode'))}">${escapeHtml(node.text || '')}</textarea>
        <div class="prompt-node-tools">
            <button class="prompt-node-pill prompt-node-control prompt-preset-edit ${templateActive ? 'active' : ''}" type="button"><i data-lucide="library"></i><span>模板库</span></button>
            <button class="prompt-node-pill prompt-node-control prompt-split-toggle ${node.promptSplitEnabled ? 'active' : ''}" type="button"><i data-lucide="split"></i><span>分隔符</span></button>
            <button class="prompt-node-pill prompt-node-control prompt-poster-copy-toggle ${node.posterCopyEnabled ? 'active' : ''}" type="button" title="${node.posterCopyEnabled ? '复刻主参考图可读海报文案，避免随机文字' : '禁止输出可读海报文案'}"><i data-lucide="type"></i><span>海报文案</span></button>
            <button class="prompt-node-pill prompt-camera-toggle ${node.cameraEnabled ? 'active' : ''}" type="button"><i data-lucide="camera"></i><span>相机</span></button>
            <button class="prompt-node-pill prompt-llm-toggle ${node.llmEnabled ? 'active' : ''}" type="button"><i data-lucide="sparkles"></i><span>LLM</span></button>
        </div>
        ${referenceWeightHtml}
        ${cameraControlHtml}
        ${node.promptSplitEnabled ? `<div class="prompt-node-split-row">
            <label class="prompt-node-split-control prompt-node-control"><span>分隔符</span><input class="prompt-node-separator" type="text" value="${escapeHtml(node.promptSeparator)}" maxlength="8" placeholder=";"></label>
            <span class="prompt-node-split-count">${promptItems.length || 0} 段</span>
        </div>
        <div class="prompt-node-segments" style="height:${promptSplitPreviewH}px">${promptItems.length ? promptItems.map((item, index) => `<div class="prompt-node-segment"><span>${index + 1}</span><p>${escapeHtml(item)}</p></div>`).join('') : ''}</div>
        <div class="prompt-split-preview-resize prompt-node-control" data-prompt-split-resize="1" title="拖动调整高度"><span></span></div>` : ''}
        ${inputThumbs}
        ${llmParams}
    </div>`;
}
function refreshPromptNodeSegmentsUi(el, node){
    const items = promptNodePromptItems(node);
    const count = el.querySelector('.prompt-node-split-count');
    if(count) count.textContent = `${items.length || 0} 段`;
    const list = el.querySelector('.prompt-node-segments');
    if(list){
        list.innerHTML = items.length
            ? items.map((item, index) => `<div class="prompt-node-segment"><span>${index + 1}</span><p>${escapeHtml(item)}</p></div>`).join('')
            : '';
    }
}
function loopNumberControlHtml({label, value, key, min=1, max=100, quick=[1,2,3,4,5,6,8,10]}){
    const v = Math.max(min, Math.min(max, Number(value) || min));
    return `<div class="loop-number-control">
        <button class="loop-smart-control loop-number-trigger" type="button"><span>${escapeHtml(label)}</span><strong>${v}</strong></button>
        <div class="loop-number-popover">
            <div class="loop-number-grid">
                ${quick.map(n => `<button type="button" class="loop-smart-control loop-number-cell ${n === v ? 'active' : ''}" data-loop-number="${escapeHtml(key)}" data-loop-value="${n}">${n}</button>`).join('')}
            </div>
            <label class="loop-number-custom">
                <span>${escapeHtml(tr('common.custom'))}</span>
                <input class="loop-smart-control loop-number-input" type="number" min="${min}" max="${max}" step="1" data-loop-number-input="${escapeHtml(key)}" value="${v}">
            </label>
        </div>
    </div>`;
}
function smartLoopTokenLabel(token){
    if(token === '《计数》' || token === '[计数]') return tr('canvas.counterToken');
    return token;
}
function smartLoopTokenChipHtml(token){
    return `<span class="loop-smart-token-chip" contenteditable="false" data-token="${escapeHtml(token)}"><span>${escapeHtml(smartLoopTokenLabel(token))}</span><button type="button" aria-label="${escapeHtml(tr('common.delete'))}" title="${escapeHtml(tr('common.delete'))}">×</button></span>`;
}
function smartLoopVariableHtml(text){
    return String(text || '').split(/(《计数》|\[计数\])/g).map(part => {
        if(part === '《计数》' || part === '[计数]') return smartLoopTokenChipHtml('《计数》');
        return escapeHtml(part);
    }).join('');
}
function smartLoopEditorText(editor){
    const walk = node => {
        if(node.nodeType === Node.TEXT_NODE) return node.nodeValue || '';
        if(node.nodeType !== Node.ELEMENT_NODE) return '';
        if(node.classList?.contains('loop-smart-token-chip')) return node.dataset.token || '';
        if(node.tagName === 'BR') return '\n';
        return [...node.childNodes].map(walk).join('');
    };
    return [...(editor?.childNodes || [])].map(walk).join('').replace(/\u00a0/g, ' ');
}
function insertSmartLoopToken(editor, token){
    if(!editor) return;
    editor.focus();
    const chipWrap = document.createElement('span');
    chipWrap.innerHTML = smartLoopTokenChipHtml(token);
    const chip = chipWrap.firstElementChild;
    const spacer = document.createTextNode(' ');
    const sel = window.getSelection();
    if(sel && sel.rangeCount && editor.contains(sel.anchorNode)){
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(spacer);
        range.insertNode(chip);
        range.setStartAfter(spacer);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    } else {
        editor.appendChild(chip);
        editor.appendChild(spacer);
    }
}
function smartLoopBodyHtml(node){
    node.count = smartLoopCount(node);
    node.mode = node.mode === 'parallel' ? 'parallel' : 'serial';
    node.loopStart = Math.max(1, Number(node.loopStart) || 1);
    node.imageBatchSize = Math.max(1, Math.min(100, Number(node.imageBatchSize) || 1));
    node.showPrompt = Boolean(node.showPrompt);
    node.imageInput = Boolean(node.imageInput);
    const imageCount = smartLoopInputImages(node, {index:node.loopStart}).length;
    const loopThumbs = smartNodeInputThumbsHtml(smartLoopPreviewImages(node));
    const promptItems = smartLoopInputPromptItems(node);
    const promptFields = smartLoopPromptFieldValues(node);
    const visiblePromptFields = promptFields.length ? promptFields : [''];
    const promptHint = promptItems.length
        ? trf('smart.loopPromptHintFound', {n:promptItems.length})
        : tr('smart.loopPromptHintVariable');
    const currentUpstreamPrompt = smartLoopSelectedInputPrompt(node, {index:node.loopStart});
    const defaultPrompt = tr('smart.loopDefaultPrompt') || '现在生成第《计数》张卖点图片';
    const loopRunState = smartCascadeRunForLoop(node.id);
    const loopRunning = Boolean(loopRunState);
    const loopStopping = Boolean(loopRunState?.stopRequested);
    return `<div class="loop-smart-card ${node.imageInput ? 'has-image' : ''} ${node.showPrompt ? 'has-prompt' : ''}">
        <div class="loop-smart-row loop-smart-top">
            <div class="loop-smart-seg">
                <button type="button" class="loop-smart-control ${node.mode !== 'parallel' ? 'active' : ''}" data-loop-mode="serial">${escapeHtml(tr('canvas.loopSerial'))}</button>
                <button type="button" class="loop-smart-control ${node.mode === 'parallel' ? 'active' : ''}" data-loop-mode="parallel" title="${escapeHtml(tr('smart.loopParallelTip'))}">${escapeHtml(tr('canvas.loopParallel'))}</button>
            </div>
        </div>
        <div class="loop-smart-row">
            <button class="loop-smart-control loop-smart-toggle ${node.imageInput ? 'active' : ''}" type="button" data-loop-toggle="image"><i data-lucide="image"></i><span>${escapeHtml(tr('canvas.loopImageToggle'))}</span></button>
            <button class="loop-smart-control loop-smart-toggle ${node.showPrompt ? 'active' : ''}" type="button" data-loop-toggle="prompt"><i data-lucide="text-cursor-input"></i><span>${escapeHtml(tr('canvas.loopPromptToggle'))}</span></button>
        </div>
        ${node.imageInput ? `<div class="loop-smart-panel">
            ${loopThumbs}
            <div class="loop-smart-mini">
                ${loopNumberControlHtml({label:tr('canvas.loopBatchSize'), value:node.imageBatchSize, key:'imageBatchSize', max:100, quick:[1,2,3,4,5,6,8,10]})}
            </div>
            <div class="loop-smart-note">${imageCount ? escapeHtml(trf('canvas.loopImageWillOutput', {n:imageCount})) : escapeHtml(tr('canvas.loopImageEmpty'))}</div>
        </div>` : ''}
        ${node.showPrompt ? `<div class="loop-smart-panel prompt-panel">
            ${currentUpstreamPrompt ? `<div class="loop-smart-upstream">
                <div class="loop-smart-upstream-label">${escapeHtml(promptHint)}</div>
                <div class="loop-smart-upstream-text">${escapeHtml(currentUpstreamPrompt)}</div>
            </div>` : ''}
            <div class="loop-smart-prompt-list">
                ${visiblePromptFields.map((value, index) => `<div class="loop-smart-prompt-item">
                    <div class="loop-smart-prompt-index">${index + 1}</div>
                    <div class="loop-smart-control loop-smart-text" contenteditable="true" data-loop-prompt-index="${index}" data-placeholder="${escapeHtml(tr('canvas.loopVariablePlaceholder'))}">${smartLoopVariableHtml(value || (index === 0 && !promptFields.length ? defaultPrompt : ''))}</div>
                    <button class="loop-smart-control loop-smart-icon-btn" type="button" data-loop-prompt-delete="${index}" ${visiblePromptFields.length <= 1 ? 'disabled' : ''} title="${escapeHtml(tr('common.delete'))}" aria-label="${escapeHtml(tr('common.delete'))}">×</button>
                </div>`).join('')}
            </div>
            <div class="loop-smart-row loop-smart-prompt-actions">
                <button class="loop-smart-control loop-smart-token loop-smart-counter-token" type="button" data-loop-token="《计数》">${escapeHtml(tr('canvas.counterToken'))}</button>
                <span class="loop-smart-note">${escapeHtml(promptHint)}</span>
                <button class="loop-smart-control loop-smart-add-prompt" type="button" data-loop-prompt-add="1" title="新增" aria-label="新增"><i data-lucide="plus"></i></button>
            </div>
        </div>` : ''}
        <div class="loop-smart-footer">
            ${loopNumberControlHtml({label:tr('canvas.loopImageStart'), value:node.loopStart, key:'loopStart', max:9999, quick:[1,2,3,4,5,6,8,10]})}
            ${loopNumberControlHtml({label:tr('canvas.loopCount'), value:node.count, key:'count', max:100, quick:[1,2,3,4,5,6,8,10]})}
            <button class="loop-smart-control loop-smart-run ${loopRunning ? 'is-stop' : ''}" type="button" data-loop-run="${escapeHtml(node.id)}" ${loopStopping ? 'disabled' : ''}><i data-lucide="${loopRunning ? 'square' : 'workflow'}"></i><span>${escapeHtml(loopRunning ? smartCascadeStopText(loopStopping) : tr('smart.loopRunAll'))}</span></button>
        </div>
    </div>`;
}
function smartFrameGroupBodyHtml(node){
    const members = smartGroupMembers(node);
    const note = node.groupNote || '';
    const images = (node.images || []).map(imageForDisplay).filter(item => item?.url);
    const cols = images.length <= 4 ? 2 : 3;
    return `<div class="smart-frame-group-card">
        <div class="smart-frame-group-bar">
            <div class="smart-frame-group-summary"><i data-lucide="folder"></i><span>${escapeHtml(node.title || '编组')} · ${members.length} 个节点</span></div>
            <textarea class="smart-frame-group-note" data-smart-frame-note placeholder="添加备注...">${escapeHtml(note)}</textarea>
        </div>
        ${images.length ? `<div class="smart-frame-group-media" style="--frame-media-cols:${cols}">
            ${images.map((item, index) => `<div class="thumb-item ${selectedImage.nodeId === node.id && selectedImage.index === index ? 'image-selected' : ''}" data-image-index="${index}" data-media-signature="${escapeAttr(`${mediaKindForItem(item)}:${item.url || ''}`)}">${thumbMediaHtml(item)}${imageResolutionBadgeHtml(item)}</div>`).join('')}
        </div>` : ''}
    </div>`;
}
function smartGroupBodyHtml(node){
    if(isSmartFrameGroup(node)) return smartFrameGroupBodyHtml(node);
    const groupThumbLayout = smartGroupThumbLayout(node);
    const refThumbs = groupThumbLayout?.refs || [];
    const members = smartGroupMembers(node);
    const counts = members.reduce((acc, member) => {
        if(member.type === 'smart-prompt') acc.prompt += 1;
        else if(member.type === 'smart-loop') acc.loop += 1;
        return acc;
    }, {prompt:0, media:refThumbs.length, loop:0});
    const summary = [
        counts.prompt ? `${counts.prompt} 提示词` : '',
        counts.media ? `${counts.media} 图片` : '',
        counts.loop ? `${counts.loop} 循环` : ''
    ].filter(Boolean).join(' · ') || '双击或拖入图片';
    if(refThumbs.length){
        const totalThumbs = Math.max(1, Number(groupThumbLayout?.rows || 1) * Number(groupThumbLayout?.cols || 1));
        if(totalThumbs === 1 && refThumbs.length === 1){
            const ref = refThumbs[0];
            const innerW = Math.max(24, Number(groupThumbLayout.innerW || groupThumbLayout.width || SMART_GROUP_DEFAULT_WIDTH));
            const innerH = Math.max(24, Number(groupThumbLayout.innerH || groupThumbLayout.height || SMART_GROUP_DEFAULT_HEIGHT));
            const canDelete = ref.nodeId === node.id;
            return `<div class="smart-group-card has-thumbs">
                <div class="smart-group-summary"><i data-lucide="group"></i><span>${escapeHtml(summary)}</span></div>
                <div class="image-wrap smart-group-single-thumb ${selectedImage.nodeId === ref.nodeId && Number(selectedImage.index) === Number(ref.index) ? 'image-selected' : ''}" data-ref-node-id="${escapeAttr(ref.nodeId)}" data-ref-image-index="${ref.index}" data-image-index="${ref.index}" data-media-signature="${escapeAttr(`${mediaKindForItem(ref.item)}:${ref.item?.url || ''}`)}" style="--node-img-w:${innerW}px;--node-img-h:${innerH}px">${singleMediaHtml(ref.item, innerW, innerH)}${imageResolutionBadgeHtml(ref.item)}${canDelete ? `<button class="mini-x image-delete" type="button" data-image-index="${ref.index}" title="${escapeHtml(tr('smart.deleteImage'))}"><i data-lucide="trash-2"></i></button>` : ''}</div>
            </div>`;
        }
        const groupMaxVisibleRows = (groupThumbLayout.compactMembers || []).length ? Number(groupThumbLayout.rows || 1) : SMART_GROUP_MAX_VISIBLE_ROWS;
        const visibleRows = Math.max(1, Math.min(groupMaxVisibleRows, Number(groupThumbLayout.visibleRows || groupThumbLayout.rows || 1)));
        const maxHeight = Math.max(44, visibleRows * Number(groupThumbLayout.thumb || 96) + Math.max(0, visibleRows - 1) * 8);
        return `<div class="smart-group-card has-thumbs">
            <div class="smart-group-summary"><i data-lucide="group"></i><span>${escapeHtml(summary)}</span></div>
            <div class="thumb-grid smart-group-thumb-grid" data-thumb-scroll="1" style="--thumb-cols:${groupThumbLayout.cols}; --thumb-size:${groupThumbLayout.thumb}px; --thumb-max-height:${maxHeight}px">${refThumbs.map(ref => {
                const canDelete = ref.nodeId === node.id;
                return `<div class="thumb-item ${selectedImage.nodeId === ref.nodeId && Number(selectedImage.index) === Number(ref.index) ? 'image-selected' : ''}" data-ref-node-id="${escapeAttr(ref.nodeId)}" data-ref-image-index="${ref.index}" data-image-index="${ref.index}" data-media-signature="${escapeAttr(`${mediaKindForItem(ref.item)}:${ref.item?.url || ''}`)}">${thumbMediaHtml(ref.item)}${imageResolutionBadgeHtml(ref.item)}${canDelete ? `<button class="mini-x image-delete" type="button" data-image-index="${ref.index}" title="${escapeHtml(tr('smart.deleteImage'))}"><i data-lucide="trash-2"></i></button>` : ''}</div>`;
            }).join('')}</div>
        </div>`;
    }
    return `<div class="smart-group-card">
        <div class="smart-group-summary"><i data-lucide="group"></i><span>${escapeHtml(summary)}</span></div>
        ${members.length ? '' : `<div class="smart-group-empty"><i data-lucide="plus"></i><span>拖入图片自动收进分组</span></div>`}
    </div>`;
}
function nodeBodyHtml(node, layout){
    if(node.type === 'smart-group') return smartGroupBodyHtml(node);
    if(node.type === 'smart-prompt') return promptNodeBodyHtml(node);
    if(node.type === 'smart-loop') return smartLoopBodyHtml(node);
    const imgs = (node.images || []).map(imageForDisplay);
    if(node.jimengPending && node.jimengPending.submitId && imgs.length === 0){
        return jimengPendingBodyHtml(node, layout);
    }
    const recoverTask = smartRecoverableImageTask(node);
    if(recoverTask && imgs.length === 0){
        return imageTaskRecoverBodyHtml(node, recoverTask, layout);
    }
    if(node.queued && imgs.length === 0 && !node.pending){
        return `<div class="loading-cell single queued" style="width:${layout.width}px;height:${layout.height}px"></div>`;
    }
    if(node.pending && imgs.length === 0){
        const count = Math.max(1, Number(node.pending) || 1);
        if(count <= 1) return `<div class="loading-cell single" style="width:${layout.width}px;height:${layout.height}px"></div>`;
        const cols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(count))));
        const rows = Math.ceil(count / cols);
        return `<div class="loading-skeleton" style="grid-template-columns:repeat(${cols}, 1fr);grid-template-rows:repeat(${rows}, 1fr);width:${layout.width}px;height:${layout.height}px;padding:8px;box-sizing:border-box">${Array.from({length:count}).map(() => `<div class="loading-cell"></div>`).join('')}</div>`;
    }
    if(imgs.length > 1){
        const visibleRows = Math.max(1, Math.min(MEDIA_GROUP_MAX_VISIBLE_ROWS, Number(layout.visibleRows || layout.rows || 1)));
        const maxHeight = visibleRows * Number(layout.thumb || 96) + Math.max(0, visibleRows - 1) * 8;
        return `<div class="thumb-grid" data-thumb-scroll="1" style="--thumb-cols:${layout.cols}; --thumb-size:${layout.thumb}px; --thumb-max-height:${maxHeight}px">${imgs.map((img, i) => `<div class="thumb-item ${selectedImage.nodeId === node.id && selectedImage.index === i ? 'image-selected' : ''}" data-image-index="${i}" data-media-signature="${escapeAttr(`${mediaKindForItem(img)}:${img?.url || ''}`)}">${thumbMediaHtml(img)}${imageResolutionBadgeHtml(img)}<button class="mini-x image-delete" type="button" data-image-index="${i}" title="${escapeHtml(tr('smart.deleteImage'))}"><i data-lucide="trash-2"></i></button></div>`).join('')}</div>`;
    }
    if(imgs[0]) return `<div class="image-wrap ${selectedImage.nodeId === node.id && selectedImage.index === 0 ? 'image-selected' : ''}" data-image-index="0" data-media-signature="${escapeAttr(`${mediaKindForItem(imgs[0])}:${imgs[0]?.url || ''}`)}" style="--node-img-w:${layout.width}px;--node-img-h:${layout.height}px">${singleMediaHtml(imgs[0], layout.width, layout.height)}${imageResolutionBadgeHtml(imgs[0])}<button class="mini-x image-delete" type="button" data-image-index="0" title="${escapeHtml(tr('smart.deleteImage'))}"><i data-lucide="trash-2"></i></button></div>`;
    return `<div class="node-drop" data-upload-action="files">
        <span class="upload-node-main"><i data-lucide="upload-cloud"></i></span>
        <span class="upload-node-title">${escapeHtml(tr('smart.createImportNode'))}</span>
        <span class="upload-node-sub">拖拽 / 粘贴 / 点击上传</span>
    </div>`;
}
function jimengPendingBodyHtml(node, layout){
    const jp = node.jimengPending || {};
    const querying = Boolean(jp.querying);
    const queueText = jimengQueueText(jp.queueInfo);
    return `<div class="jimeng-pending-cell loading-cell single" style="width:${layout.width}px;height:${layout.height}px">
        <div class="jimeng-pending-overlay">
            <div class="jimeng-pending-spinner"><i data-lucide="loader-2"></i></div>
            <div class="jimeng-pending-text">${escapeHtml(queueText)}</div>
            <div class="jimeng-pending-sub">任务未丢失，可继续等待或手动查询</div>
            <button class="jimeng-pending-query" type="button" data-jimeng-query="${escapeAttr(node.id)}" ${querying ? 'disabled' : ''}><i data-lucide="${querying ? 'loader-2' : 'refresh-cw'}"></i><span>${querying ? '查询中…' : '查询结果'}</span></button>
        </div>
    </div>`;
}
function smartRecoverableImageTask(node){
    return smartPendingTasks(node).find(task => task.failed && task.recoverTaskId) || null;
}
function imageTaskRecoverBodyHtml(node, task, layout){
    const querying = Boolean(task.querying);
    const failedCount = smartPendingTasks(node).filter(item => item.failed && item.recoverTaskId).length;
    const title = querying ? '查询中' : '任务未丢失';
    const sub = failedCount > 1 ? `还有 ${failedCount} 个任务可查询` : `任务 ID：${task.recoverTaskId || ''}`;
    return `<div class="jimeng-pending-cell loading-cell single" style="width:${layout.width}px;height:${layout.height}px">
        <div class="jimeng-pending-overlay">
            <div class="jimeng-pending-spinner"><i data-lucide="${querying ? 'loader-2' : 'refresh-cw'}"></i></div>
            <div class="jimeng-pending-text">${escapeHtml(title)}</div>
            <div class="jimeng-pending-sub">${escapeHtml(sub)}</div>
            <button class="jimeng-pending-query" type="button" data-image-task-query="${escapeAttr(node.id)}" data-task-id="${escapeAttr(task.taskId)}" ${querying ? 'disabled' : ''}><i data-lucide="${querying ? 'loader-2' : 'refresh-cw'}"></i><span>${querying ? '查询中…' : '查询结果'}</span></button>
        </div>
    </div>`;
}
function smartNodeToolbarImageIndex(node){
    const images = node?.images || [];
    if(selectedImage.nodeId === node?.id){
        const index = Number(selectedImage.index);
        if(Number.isFinite(index) && index >= 0 && index < images.length) return index;
    }
    return 0;
}
function smartNodeToolbarHtml(node){
    const isImageNode = node?.type === 'smart-image' || !node?.type;
    const images = node?.images || [];
    if(!isImageNode || !images.some(img => img?.url)) return '';
    const item = imageForDisplay(images[smartNodeToolbarImageIndex(node)] || images.find(img => img?.url));
    if(!item?.url) return '';
    const kind = mediaKindForItem(item);
    const canEditImage = kind === 'image';
    const styleMatching = Boolean(node.styleMatching);
    const imageCount = images.filter(img => mediaKindForItem(imageForDisplay(img)) === 'image' && imageForDisplay(img)?.url).length;
    const gridLabel = imageCount > 1 ? '宫格拼接' : '宫格切分';
    const actions = [
        {key:'preview', icon:'eye', label:'预览', enabled:kind === 'image' || kind === 'video'},
        {key:'style-match', icon:styleMatching ? 'loader-2' : 'sparkles', label:styleMatching ? '匹配中' : '匹配提示词', enabled:canEditImage && !styleMatching},
        {key:'crop', icon:'crop', label:'裁剪', enabled:canEditImage},
        {key:'outpaint', icon:'expand', label:'扩图', enabled:canEditImage},
        {key:'mask', icon:'brush', label:'遮罩', enabled:canEditImage},
        {key:'brush', icon:'paintbrush', label:'画笔', enabled:canEditImage},
        {key:'grid', icon:'grid-3x3', label:gridLabel, enabled:canEditImage},
        {key:'download', icon:'download', label:'下载', enabled:true}
    ];
    return `<div class="smart-node-floating-menu" data-smart-node-menu="1">${actions.map(action => `
        <button type="button" data-smart-node-action="${escapeAttr(action.key)}" data-node-id="${escapeAttr(node.id)}" ${action.enabled ? '' : 'disabled'} title="${escapeAttr(action.label)}">
            <i data-lucide="${escapeAttr(action.icon)}"></i><span>${escapeHtml(action.label)}</span>
        </button>`).join('')}</div>`;
}
function duplicateSmartNodeMediaToCanvas(node, imageIndex){
    const source = node?.images?.[imageIndex];
    const item = imageForDisplay(source);
    if(!node || !item?.url){ toast('没有可导出到画布的素材'); return; }
    pushUndo();
    const rect = nodeRect(node);
    const point = {x:rect.x + rect.width + 220, y:rect.y + rect.height / 2};
    const copy = {...item};
    const newNode = createImageNodeAt(point, [copy], {select:true, skipUndo:true});
    selectedIds = [];
    selectedImage = {nodeId:newNode.id, index:0};
    render();
    scheduleSave();
    toast('已添加到画布');
}
function styleCasePreviewReference(cases){
    return null;
}
async function matchStylePromptForNode(nodeId, imageIndex=0){
    const node = nodes.find(n => n.id === nodeId);
    const source = node?.images?.[imageIndex];
    const item = imageForDisplay(source);
    if(!node || !item?.url){ toast('没有可匹配的图片'); return; }
    if(mediaKindForItem(item) !== 'image'){ toast('只能用图片匹配提示词'); return; }
    if(node.styleMatching) return;
    const provider = resolveChatProviderId(settings.provider_id || '');
    const model = resolveChatModel('', provider);
    node.styleMatching = true;
    render();
    toast('正在匹配提示词...');
    try {
        const response = await fetch('/api/style-library/match-image', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                image:smartOriginalMediaUrl(item),
                provider,
                model,
                limit:4
            })
        });
        const data = await response.json().catch(() => ({}));
        if(!response.ok) throw new Error(data.detail || '匹配提示词失败');
        const rawPrompt = String(data.prompt || data.analysis?.positive_prompt || '').trim();
        if(!rawPrompt) throw new Error('没有生成可用提示词');
        const promptBudget = smartCompressPromptToBudget(rawPrompt, SMART_MATCHED_PROMPT_BUDGET);
        const prompt = promptBudget.prompt;
        pushUndo();
        const rect = nodeRect(node);
        const promptNode = createPromptNode(rect.x + rect.width + 88, rect.y, {skipUndo:true, select:true});
        const rematchModel = preferredPromptRematchModel(provider);
        promptNode.text = prompt;
        promptNode.h = Math.max(240, Math.min(420, 180 + Math.ceil(prompt.length / 5)));
        const caseReference = styleCasePreviewReference(data.cases);
        promptNode.manualInputRefs = [{
            ...item,
            url:smartOriginalMediaUrl(item),
            kind:mediaKindForItem(item) || 'image',
            name:item.name || 'Strict composition reference',
            role:'composition_reference',
            sourceNodeId:node.id,
            sourceImageIndex:imageIndex,
            styleLock:false
        }, caseReference].filter(Boolean);
        promptNode.referenceLock = false;
        promptNode.referenceWeight = 65;
        promptNode.llmEnabled = true;
        promptNode.llmProvider = provider;
        promptNode.llmModel = rematchModel;
        promptNode.llmInstruction = '';
        promptNode.llmSystemEnabled = true;
        promptNode.llmSystemPrompt = 'Revise the matched prompt with the latest user modification, re-search the style library, and return a complete image generation prompt.';
        promptNode.styleMatch = {
            image:smartOriginalMediaUrl(item),
            query:data.query || '',
            cases:Array.isArray(data.cases) ? data.cases : [],
            analysis:data.analysis || {},
            model:data.model || model,
            rematchModel,
            source:data.source || '',
            reference_lock:false,
            referenceWeight:65,
            created_at:Date.now()
        };
        connectInputNode(node.id, promptNode.id);
        selectedId = promptNode.id;
        selectedIds = [];
        selectedImage = {nodeId:'', index:-1};
        render();
        scheduleSave();
        const compressionNote = promptBudget.changed
            ? `，提示词已压缩 ${promptBudget.originalLength} → ${promptBudget.compressedLength} 字`
            : '';
        toast(`已匹配 ${promptNode.styleMatch.cases.length || 0} 个风格案例${compressionNote}`);
    } catch(err) {
        toast((err.message || '匹配提示词失败').slice(0, 180));
    } finally {
        const latest = nodes.find(n => n.id === nodeId);
        if(latest) delete latest.styleMatching;
        render();
    }
}
function runSmartNodeToolbarAction(nodeId, action){
    const node = nodes.find(n => n.id === nodeId);
    if(!node) return;
    const index = smartNodeToolbarImageIndex(node);
    const item = imageForDisplay(node.images?.[index]);
    if(!item?.url) return;
    const kind = mediaKindForItem(item);
    selectedId = nodeId;
    selectedIds = [];
    selectedImage = {nodeId, index};
    if(action === 'download'){
        downloadPreviewFile(node.images?.[index] || item);
        return;
    }
    if(action === 'canvas'){
        duplicateSmartNodeMediaToCanvas(node, index);
        return;
    }
    if(action === 'style-match'){
        matchStylePromptForNode(nodeId, index);
        return;
    }
    if(kind !== 'image' && action !== 'preview'){
        toast('当前素材不支持该操作');
        return;
    }
    if(action === 'preview'){
        openImagePreview(nodeId, index);
        return;
    }
    const modeMap = {crop:'crop', outpaint:'outpaint', mask:'mask', brush:'brush', grid:'grid'};
    openImageEditor(nodeId, index);
    setImageEditMode(modeMap[action] || 'preview', true);
    if(action === 'grid' && canGridJoinCurrentNode()){
        setGridOperationMode('join');
    }
}
// 智能分组顶部小菜单：整理排列 / 预览（整组左右切换）/ 宫格拼接 / 批量下载 / 解散分组。
// 与多图节点的 smart-node-floating-menu 同款样式与定位（选中分组时浮在卡片上方）。
function smartGroupToolbarHtml(node){
    if(!isSmartGroupNode(node)) return '';
    const hasContent = (node.images || []).some(img => img?.url) || smartGroupMembers(node).length > 0;
    const imageCount = (node.images || []).filter(img => img?.url).length;
    const actions = [
        {key:'arrange', icon:'layout-grid', label:'整理排列', enabled:hasContent},
        {key:'preview', icon:'eye', label:'预览', enabled:imageCount > 0},
        {key:'grid', icon:'grid-3x3', label:'宫格拼接', enabled:imageCount > 1},
        {key:'download', icon:'archive', label:'批量下载', enabled:imageCount > 0},
        {key:'ungroup', icon:'ungroup', label:'解散分组', enabled:true}
    ];
    return `<div class="smart-node-floating-menu" data-smart-group-menu="1">${actions.map(action => `
        <button type="button" data-smart-group-action="${escapeAttr(action.key)}" data-node-id="${escapeAttr(node.id)}" ${action.enabled ? '' : 'disabled'} title="${escapeAttr(action.label)}">
            <i data-lucide="${escapeAttr(action.icon)}"></i><span>${escapeHtml(action.label)}</span>
        </button>`).join('')}</div>`;
}
function runSmartGroupToolbarAction(nodeId, action){
    const group = nodes.find(n => n.id === nodeId);
    if(!isSmartGroupNode(group)) return;
    selectedId = nodeId;
    selectedIds = [];
    selectedImage = {nodeId:'', index:-1};
    if(action === 'arrange'){
        if(arrangeSmartGroupMembers(group)){ render(); scheduleSave(); toast('已整理分组'); }
        else toast('分组内没有可整理的节点');
        return;
    }
    if(action === 'ungroup'){ ungroupNode(nodeId); return; }
    // 图片已收进分组（group.images），预览/下载/拼接直接复用单节点机器（分组就是一个多图容器）。
    const imageCount = (group.images || []).filter(img => img?.url).length;
    if(!imageCount){ toast('分组内没有图片'); return; }
    if(action === 'preview'){
        const first = (group.images || []).findIndex(img => img?.url);
        openImagePreview(nodeId, Math.max(0, first));
        return;
    }
    if(action === 'download'){ zipDownloadImageItems(group.title, (group.images || []).map(imageForDisplay)); return; }
    if(action === 'grid'){
        if(imageCount <= 1){ toast('分组至少需要 2 张图片才能宫格拼接'); return; }
        const first = (group.images || []).findIndex(img => img?.url);
        openImageEditor(nodeId, Math.max(0, first));
        if(imageEditModal.classList.contains('open')){
            setImageEditMode('grid', true);
            setGridOperationMode('join');
        }
        return;
    }
}
function nowMs(){ return Date.now(); }
function formatRunDuration(ms){
    const total = Math.max(0, Math.floor(Number(ms || 0) / 1000));
    const min = Math.floor(total / 60);
    const sec = total % 60;
    return min ? `${min}:${String(sec).padStart(2, '0')}` : `${sec}s`;
}
function nodeRunElapsedMs(node){
    if(!node) return 0;
    if(node.runFinishedAt && node.runStartedAt) return Number(node.runElapsedMs) || (Number(node.runFinishedAt) - Number(node.runStartedAt));
    if(node.runStartedAt) return nowMs() - Number(node.runStartedAt);
    return 0;
}
function runTimePillHtml(node){
    if(!node || node.runTimerHidden || node.type === 'smart-prompt') return '';
    const running = Boolean(node.pending || node.running || node.jimengPending);
    if(!running && !node.runFinishedAt) return '';
    const cls = running ? '' : ' done';
    return `<span class="run-time-pill${cls}" data-run-timer="${escapeHtml(node.id)}">${formatRunDuration(nodeRunElapsedMs(node))}</span>`;
}
function hideRunTimerForNode(node){
    if(!node || node.runTimerHidden || node.pending || node.running || node.jimengPending || !node.runFinishedAt) return false;
    node.runTimerHidden = true;
    scheduleSave();
    return true;
}
function refreshRunTimerPills(){
    const active = nodes.some(n => n.type !== 'smart-prompt' && !n.runTimerHidden && (n.pending || n.running || n.jimengPending || n.runFinishedAt));
    document.querySelectorAll('[data-run-timer]').forEach(el => {
        const node = nodes.find(n => n.id === el.dataset.runTimer);
        if(!node || node.runTimerHidden || node.type === 'smart-prompt') {
            el.remove();
            return;
        }
        el.textContent = formatRunDuration(nodeRunElapsedMs(node));
        el.classList.toggle('done', Boolean(!node.pending && !node.running && !node.jimengPending && node.runFinishedAt));
    });
    if(active && !runTimerInterval) runTimerInterval = setInterval(refreshRunTimerPills, 1000);
    if(!active && runTimerInterval){ clearInterval(runTimerInterval); runTimerInterval = null; }
}
function rememberInlineVideoActivations(){
    world.querySelectorAll('.image-node [data-image-index] video[data-inline-video-active="1"]').forEach(video => {
        const nodeEl = video.closest('.image-node');
        const itemEl = video.closest('[data-image-index]');
        const node = nodes.find(n => n.id === nodeEl?.dataset.id);
        const index = Number(itemEl?.dataset.imageIndex ?? 0);
        const image = node?.images?.[index];
        if(image && mediaKindForItem(image) === 'video') image._inlineVideoActive = true;
    });
}
function render(){
    rememberInlineVideoActivations();
    world.classList.toggle('smart-multi-selected', selectedNodeIds().length > 1);
    const composerEl = composer;
    const mediaStates = captureMediaPlaybackStates();
    const reusableNodes = new Map();
    world.querySelectorAll('.image-node').forEach(el => {
        const node = nodes.find(n => n.id === el.dataset.id);
        if(smartNodeHasLiveMedia(node)) reusableNodes.set(node.id, el);
    });
    const nodeHtmlEntries = nodes
        .filter(node => node.id !== SMART_LOG_PREVIEW_NODE_ID)
        // 分组节点先渲染（DOM 靠前→层级在下），作为成员的背板；成员渲染在后、盖在分组之上，
        // 否则缩小分组把成员挪进卡片区域时会被分组卡片背景遮住而“消失”。
        .slice()
        .sort((a, b) => (isSmartGroupNode(a) ? 0 : 1) - (isSmartGroupNode(b) ? 0 : 1))
        .map(node => {
        const imgs = node.images || [];
        const title = node.type === 'smart-group' ? (node.title === '万能分组' ? '智能分组' : (node.title || '智能分组')) : node.type === 'smart-prompt' ? 'Prompt' : node.type === 'smart-loop' ? 'Loop' : (imgs.length > 1 ? 'Group' : imgs.length ? 'Image' : escapeHtml(tr('smart.createImportNode')));
        const scale = nodeScale(node);
        const layout = imageLayout(imgs, scale, node);
        const isPrompt = node.type === 'smart-prompt';
        const isLoop = node.type === 'smart-loop';
        const isSmartGroup = node.type === 'smart-group';
        const isFrameGroup = isSmartFrameGroup(node);
        const isCompactMember = isSmartGroupCompactMember(node);
        const isImageNode = node.type === 'smart-image' || !node.type;
        const isJimengPending = Boolean(node.jimengPending && node.jimengPending.submitId && imgs.length === 0);
        const isQueued = Boolean(node.queued && imgs.length === 0 && !node.pending && !isJimengPending);
        const isEmpty = isImageNode && imgs.length === 0 && !node.pending && !isQueued && !isJimengPending;
        const isHistory = isHistoryGroupNode(node);
        const isGroup = isImageNode && imgs.length > 1;
        const isPending = ((node.pending || isQueued || isJimengPending) && imgs.length === 0);
        const body = nodeBodyHtml(node, layout);
        const deleteBtn = isGroup ? '' : `<button class="mini-x node-delete" type="button" title="${escapeHtml(tr('smart.deleteNode'))}"><i data-lucide="trash-2"></i></button>`;
        const hint = isFrameGroup ? '拖动外框移动整组 · 可填写备注' : isSmartGroup ? '双击添加 · 拖入归组 · 选中后生成' : isPending ? escapeHtml(tr('smart.hintPending')) : (imgs.length > 1 ? escapeHtml(tr('smart.hintMulti')) : imgs.length ? escapeHtml(tr('smart.hintSingle')) : escapeHtml(tr('smart.hintEmpty')));
        const html = `<div class="image-node ${isEmpty ? 'empty-node' : ''} ${isGroup ? 'group-node' : ''} ${isHistory ? 'history-group-node' : ''} ${isPrompt ? 'prompt-smart-node' : ''} ${isLoop ? 'loop-smart-node' : ''} ${isSmartGroup ? 'smart-group-node' : ''} ${isFrameGroup ? 'smart-frame-group-node' : ''} ${isCompactMember ? 'smart-group-member-node' : ''} ${isNodeSelected(node.id) ? 'selected' : ''} ${(dragState?.groupIds?.includes(node.id) || dragState?.id === node.id) ? 'dragging' : ''} ${node.running ? 'node-running' : ''} ${isPending ? 'node-pending' : ''}" data-id="${escapeHtml(node.id)}" style="left:${node.x || 0}px;top:${node.y || 0}px;width:${layout.width}px;height:${layout.height}px">
            <div class="node-head"><div class="node-title">${title}</div><div class="node-actions">${deleteBtn}</div></div>
            ${!isEmpty && !isGroup ? `<div class="floating-node-actions"><button class="mini-x node-delete" type="button" title="${escapeHtml(tr('smart.deleteNode'))}"><i data-lucide="trash-2"></i></button></div>` : ''}
            ${smartNodeToolbarHtml(node)}${smartGroupToolbarHtml(node)}
            ${runTimePillHtml(node)}
            <div class="node-body">${body}</div>
            <div class="node-hint">${hint}</div>
            ${imgs.length || node.pending || isQueued || isJimengPending || isPrompt || isLoop || isSmartGroup ? '<div class="node-resize-handle" data-resize="1"></div>' : ''}
            <div class="node-port port-in" data-port="in" title="input"></div>
            <div class="node-port port-out" data-port="out" title="output"></div>
        </div>`;
        return {node, html};
    });
    const tpl = document.createElement('template');
    tpl.innerHTML = nodeHtmlEntries.map(entry => entry.html).join('');
    const renderedNodeEls = new Map();
    nodeHtmlEntries.forEach(entry => {
        const fresh = tpl.content.querySelector(`.image-node[data-id="${CSS.escape(entry.node.id)}"]`);
        if(fresh) renderedNodeEls.set(entry.node.id, fresh);
    });
    const keepEls = new Set();
    reusableNodes.forEach(el => keepEls.add(el));
    if(composerEl) keepEls.add(composerEl);
    [...world.childNodes].forEach(child => {
        if(!keepEls.has(child)) child.remove();
    });
    if(composerEl) world.appendChild(composerEl);
    world.insertAdjacentHTML('beforeend', renderConnections());
    nodeHtmlEntries.forEach(entry => {
        const fresh = renderedNodeEls.get(entry.node.id);
        if(!fresh) return;
        world.appendChild(fresh);
        const reusable = reusableNodes.get(entry.node.id);
        if(reusable){
            transplantSmartMediaElements(reusable, fresh);
            if(reusable !== fresh) reusable.remove();
        }
    });
    restoreMediaPlaybackStates(mediaStates);
    bindNodeEvents();
    bindConnectionEvents();
    updateComposer();
    renderMinimap();
    if(window.lucide) lucide.createIcons();
    bindSmartPreviewImageFallbacks(world);
    measureSmartNodeImages();
    refreshRunTimerPills();
    return;
    world.innerHTML = '';
    if(composerEl) world.appendChild(composerEl);
    world.insertAdjacentHTML('beforeend', renderConnections());
    const nodesHtml = nodes.map(node => {
        const imgs = node.images || [];
        const title = node.type === 'smart-prompt' ? 'Prompt' : node.type === 'smart-loop' ? 'Loop' : (imgs.length > 1 ? 'Group' : 'Image');
        const scale = nodeScale(node);
        const layout = imageLayout(imgs, scale, node);
        const isPrompt = node.type === 'smart-prompt';
        const isLoop = node.type === 'smart-loop';
        const isImageNode = node.type === 'smart-image' || !node.type;
        const isQueued = Boolean(node.queued && imgs.length === 0 && !node.pending);
        const isEmpty = isImageNode && imgs.length === 0 && !node.pending && !isQueued;
        const isGroup = isImageNode && imgs.length > 1;
        const isPending = (node.pending || isQueued) && imgs.length === 0;
        const body = nodeBodyHtml(node, layout);
        const deleteBtn = isGroup ? '' : `<button class="mini-x node-delete" type="button" title="${escapeHtml(tr('smart.deleteNode'))}"><i data-lucide="trash-2"></i></button>`;
        return `<div class="image-node ${isEmpty ? 'empty-node' : ''} ${isGroup ? 'group-node' : ''} ${isPrompt ? 'prompt-smart-node' : ''} ${isLoop ? 'loop-smart-node' : ''} ${isNodeSelected(node.id) ? 'selected' : ''} ${(dragState?.groupIds?.includes(node.id) || dragState?.id === node.id) ? 'dragging' : ''} ${node.running ? 'node-running' : ''} ${isPending ? 'node-pending' : ''}" data-id="${escapeHtml(node.id)}" style="left:${node.x || 0}px;top:${node.y || 0}px;width:${layout.width}px;height:${layout.height}px">
            <div class="node-head"><div class="node-title">${title}</div><div class="node-actions">${deleteBtn}</div></div>
            ${!isEmpty && !isGroup ? `<div class="floating-node-actions"><button class="mini-x node-delete" type="button" title="${escapeHtml(tr('smart.deleteNode'))}"><i data-lucide="trash-2"></i></button></div>` : ''}
            ${smartNodeToolbarHtml(node)}
            ${runTimePillHtml(node)}
            <div class="node-body">${body}</div>
            <div class="node-hint">${isPending ? escapeHtml(tr('smart.hintPending')) : (imgs.length > 1 ? escapeHtml(tr('smart.hintMulti')) : imgs.length ? escapeHtml(tr('smart.hintSingle')) : escapeHtml(tr('smart.hintEmpty')))}</div>
            ${imgs.length || node.pending || isQueued || isPrompt || isLoop ? '<div class="node-resize-handle" data-resize="1"></div>' : ''}
            <div class="node-port port-in" data-port="in" title="输入"></div>
            <div class="node-port port-out" data-port="out" title="输出"></div>
        </div>`;
    }).join('');
    world.insertAdjacentHTML('beforeend', nodesHtml);
    bindNodeEvents();
    bindConnectionEvents();
    updateComposer();
    renderMinimap();
    if(window.lucide) lucide.createIcons();
    measureSmartNodeImages();
    refreshRunTimerPills();
}
function measureSmartNodeImages(){
    world.querySelectorAll('.image-node img,.image-node video').forEach(imgEl => {
        const nodeEl = imgEl.closest('.image-node');
        const itemEl = imgEl.closest('[data-image-index]');
        const containerNode = nodes.find(n => n.id === nodeEl?.dataset.id);
        const targetNodeId = itemEl?.dataset.refNodeId || nodeEl?.dataset.id;
        const index = Number(itemEl?.dataset.refImageIndex ?? itemEl?.dataset.imageIndex ?? 0);
        const node = nodes.find(n => n.id === targetNodeId);
        const image = node?.images?.[index];
        if(imgEl.tagName?.toLowerCase() === 'img' && image?.url) bindImageProxyFallback(imgEl, image);
        if(!node || !image || image.natural_w || image.natural_h) return;
        const isPreview = isSmartPreviewImage(imgEl);
        const originalSrc = imgEl.dataset?.originalSrc || image.url || '';
        if(isPreview && imgEl.dataset?.previewKind !== 'video' && originalSrc && !image._naturalSizeLoading){
            image._naturalSizeLoading = true;
            loadSmartOriginalImageDimensions(originalSrc).then(size => {
                image._naturalSizeLoading = false;
                if(!size || image.natural_w || image.natural_h) return;
                image.natural_w = size.w;
                image.natural_h = size.h;
                delete image.layout_w;
                delete image.layout_h;
                applyThumbDisplaySizeToElement(itemEl, image, Math.max(itemEl?.clientWidth || 0, itemEl?.clientHeight || 0));
                updateImageResolutionBadgeElement(itemEl, image);
                if(!isSmartGroupNode(node) && (node.images || []).length === 1 && !node.w && !node.h){
                    const layout = singleImageLayout(image, node, mediaNodeDefaultScale(node));
                    node.w = layout.width;
                    node.h = layout.height;
                }
                updateNodeElementDuringResize(node);
                if(containerNode && containerNode.id !== node.id) updateNodeElementDuringResize(containerNode);
                if(isNodeSelected(node.id)) updateComposer();
                scheduleSave();
            });
        }
        if(isPreview && image.layout_w && image.layout_h) return;
        const apply = () => {
            const w = imgEl.naturalWidth || imgEl.videoWidth || 0;
            const h = imgEl.naturalHeight || imgEl.videoHeight || 0;
            if(w <= 0 || h <= 0 || image.natural_w || image.natural_h) return;
            const prevW = Number(image.layout_w || 0);
            const prevH = Number(image.layout_h || 0);
            if(isPreview){
                if(prevW === w && prevH === h) return;
                image.layout_w = w;
                image.layout_h = h;
            } else {
                image.natural_w = w;
                image.natural_h = h;
                delete image.layout_w;
                delete image.layout_h;
            }
            applyThumbDisplaySizeToElement(itemEl, image, Math.max(itemEl?.clientWidth || 0, itemEl?.clientHeight || 0));
            updateImageResolutionBadgeElement(itemEl, image);
            if(!isSmartGroupNode(node) && (node.images || []).length === 1 && !node.w && !node.h){
                const layout = singleImageLayout(image, node, mediaNodeDefaultScale(node));
                node.w = layout.width;
                node.h = layout.height;
            }
            updateNodeElementDuringResize(node);
            if(containerNode && containerNode.id !== node.id) updateNodeElementDuringResize(containerNode);
            if(isNodeSelected(node.id)) updateComposer();
            scheduleSave();
        };
        const isVideo = imgEl.tagName?.toLowerCase() === 'video';
        if(!isVideo && imgEl.complete) apply();
        else imgEl.addEventListener('load', apply, {once:true});
        imgEl.addEventListener('loadedmetadata', apply, {once:true});
    });
}
function bindConnectionEvents(){
    const svg = world.querySelector('svg.connection-layer');
    if(!svg) return;
    const connTarget = target => target?.closest?.('[data-conn-index]');
    const stopCanvasGesture = e => {
        if(!connTarget(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
    };
    svg.addEventListener('pointerdown', stopCanvasGesture);
    svg.addEventListener('mousedown', stopCanvasGesture);
    svg.addEventListener('click', e => {
        const cut = e.target?.closest?.('.conn-cut[data-conn-index]');
        if(!cut) return;
        e.preventDefault();
        e.stopPropagation();
        disconnectConnections(cut.dataset.connIndex);
    });
    svg.addEventListener('dblclick', e => {
        const hit = e.target?.closest?.('.conn-hit[data-conn-index]');
        if(!hit) return;
        e.preventDefault();
        e.stopPropagation();
        disconnectConnections(hit.dataset.connIndex);
    });
}
function ensurePortDragPathElement(){
    const svg = world.querySelector('svg.connection-layer');
    if(!svg) return null;
    let path = svg.querySelector('path.port-drag-temp');
    if(!path){
        path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'port-drag-temp conn-pending');
        path.setAttribute('stroke', 'rgba(100,116,139,0.92)');
        path.setAttribute('stroke-width', '1.9');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        svg.appendChild(path);
    }
    return path;
}
function clearPortDragVisual(){
    world.querySelector('path.port-drag-temp')?.remove();
    world.querySelectorAll('.node-port.is-active').forEach(el => el.classList.remove('is-active'));
    world.querySelectorAll('.image-node.port-hover').forEach(el => el.classList.remove('port-hover'));
}
function bindPromptNodeControls(el, node){
    el.querySelectorAll('.prompt-node-control, .prompt-node-pill').forEach(control => {
        control.addEventListener('mousedown', e => e.stopPropagation());
        control.addEventListener('click', e => e.stopPropagation());
        control.addEventListener('dblclick', e => e.stopPropagation());
    });
    const textEl = el.querySelector('.prompt-node-text');
    if(textEl) {
        bindScrollableText(textEl);
        textEl.oninput = e => {
            const prevExtra = promptNodeSplitExtraHeight(node);
            node.text = e.target.value;
            refreshPromptNodeSegmentsUi(el, node);
            if(node.promptSplitEnabled === true){
                syncPromptNodeHeightForSplit(node, prevExtra);
                updateNodeElementDuringResize(node);
            }
            scheduleSave();
        };
    }
    const separatorEl = el.querySelector('.prompt-node-separator');
    if(separatorEl) {
        separatorEl.oninput = e => {
            const prevExtra = promptNodeSplitExtraHeight(node);
            node.promptSeparator = e.target.value || ';';
            refreshPromptNodeSegmentsUi(el, node);
            syncPromptNodeHeightForSplit(node, prevExtra);
            updateNodeElementDuringResize(node);
            scheduleSave();
        };
    }
    const referenceWeightEl = el.querySelector('.prompt-style-weight-range');
    if(referenceWeightEl) {
        referenceWeightEl.oninput = e => {
            e.stopPropagation();
            const value = Math.max(0, Math.min(100, Math.round(Number(e.target.value) || 0)));
            node.styleMatch = node.styleMatch || {};
            node.styleMatch.referenceWeight = value;
            node.referenceWeight = value;
            const valueEl = el.querySelector('.prompt-style-weight-value');
            if(valueEl) valueEl.textContent = `${value}%`;
            refreshPromptNodeSegmentsUi(el, node);
            scheduleSave();
        };
    }
    const cameraToggle = el.querySelector('.prompt-camera-toggle');
    if(cameraToggle) cameraToggle.onclick = e => {
        e.preventDefault();
        e.stopPropagation();
        const prevExtra = promptNodeCameraExtraHeight(node);
        node.cameraEnabled = node.cameraEnabled !== true;
        if(node.cameraEnabled) ensurePromptNodeCameraDefaults(node);
        syncPromptNodeHeightForCamera(node, prevExtra);
        render();
        scheduleSave();
    };
    const cameraFocalEl = el.querySelector('.prompt-camera-focal');
    if(cameraFocalEl) cameraFocalEl.oninput = e => {
        e.stopPropagation();
        node.cameraFocalLength = promptNodeCameraFocalLength({cameraFocalLength:e.target.value});
        refreshPromptCameraControlUi(el, node);
        scheduleSave();
    };
    bindPromptCameraRig(el, node);
    const splitToggle = el.querySelector('.prompt-split-toggle');
    if(splitToggle) splitToggle.onclick = e => {
        e.preventDefault();
        e.stopPropagation();
        const prevExtra = promptNodeSplitExtraHeight(node);
        node.promptSplitEnabled = node.promptSplitEnabled !== true;
        if(node.promptSplitEnabled){
            node.promptSeparator = promptNodeSeparator(node);
        }
        syncPromptNodeHeightForSplit(node, prevExtra);
        render();
        scheduleSave();
    };
    const presetEdit = el.querySelector('.prompt-preset-edit');
    if(presetEdit) presetEdit.onclick = e => {
        e.preventDefault();
        e.stopPropagation();
        editPromptPresetForNode(node);
    };
    const posterCopyToggle = el.querySelector('.prompt-poster-copy-toggle');
    if(posterCopyToggle) posterCopyToggle.onclick = e => {
        e.preventDefault();
        e.stopPropagation();
        node.posterCopyEnabled = !node.posterCopyEnabled;
        render();
        scheduleSave();
    };
    const toggle = el.querySelector('.prompt-llm-toggle');
    if(toggle) toggle.onclick = e => {
        e.preventDefault(); e.stopPropagation();
        node.llmEnabled = !node.llmEnabled;
        if(node.llmEnabled){
            node.llmProvider = resolveChatProviderId(node.llmProvider || '');
            node.llmModel = resolveChatModel(node.llmModel || '', node.llmProvider);
            node.h = Math.max(Number(node.h) || 0, promptNodeExpandedHeight(node));
            node.w = Math.max(Number(node.w) || 0, 316);
        } else {
            node.h = promptNodeMinHeight(node);
            node.w = Math.max(Number(node.w) || 0, 316);
        }
        render();
        scheduleSave();
    };
    const providerEl = el.querySelector('.prompt-llm-provider');
    if(providerEl) providerEl.onchange = e => {
        e.stopPropagation();
        node.llmProvider = resolveChatProviderId(e.target.value);
        node.llmModel = resolveChatModel('', node.llmProvider);
        render();
        scheduleSave();
    };
    const modelEl = el.querySelector('.prompt-llm-model');
    if(modelEl) modelEl.onchange = e => { e.stopPropagation(); node.llmModel = e.target.value; scheduleSave(); };
    const systemToggleEl = el.querySelector('.prompt-system-toggle');
    if(systemToggleEl) systemToggleEl.onclick = e => {
        e.preventDefault();
        e.stopPropagation();
        const prevHeight = Number(node.h) || 0;
        node.llmSystemEnabled = !node.llmSystemEnabled;
        if(node.llmSystemEnabled) node.h = Math.max(prevHeight, promptNodeExpandedHeight(node));
        else if(prevHeight <= 364) node.h = promptNodeExpandedHeight(node);
        render();
        scheduleSave();
    };
    const systemEl = el.querySelector('.prompt-llm-system');
    if(systemEl) { bindScrollableText(systemEl); systemEl.oninput = e => { node.llmSystemPrompt = e.target.value; scheduleSave(); }; }
    const instructionEl = el.querySelector('.prompt-llm-instruction');
    if(instructionEl) { bindScrollableText(instructionEl); instructionEl.oninput = e => { node.llmInstruction = e.target.value; scheduleSave(); }; }
    const instructionResizeEl = el.querySelector('[data-llm-instruction-resize]');
    if(instructionResizeEl) instructionResizeEl.addEventListener('mousedown', e => {
        if(e.button !== 0) return;
        e.preventDefault(); e.stopPropagation();
        llmInstructionResizeState = {id:node.id, startY:e.clientY, startH:promptLlmInstructionHeight(node), startNodeH:promptNodeLayoutSize(node).height};
        // 拖动期间屏蔽文本框的指针/选区，否则上拉时光标滑到上方输入框会被它抢走（选中文字/失焦）。
        document.body.classList.add('smart-node-resize', 'smart-llm-instr-resize');
        capturePendingUndo();
    });
    const splitResizeEl = el.querySelector('[data-prompt-split-resize]');
    if(splitResizeEl) splitResizeEl.addEventListener('mousedown', e => {
        if(e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        promptSplitResizeState = {id:node.id, startY:e.clientY, startH:promptNodeSplitPreviewHeight(node), startNodeH:promptNodeLayoutSize(node).height};
        document.body.classList.add('smart-node-resize', 'smart-prompt-split-resize');
        capturePendingUndo();
    });
    const runEl = el.querySelector('.prompt-node-run');
    if(runEl) runEl.onclick = e => { e.preventDefault(); e.stopPropagation(); runPromptLLMNode(node.id); };
}
function bindLoopNodeControls(el, node){
    el.querySelectorAll('.loop-smart-control').forEach(control => {
        control.addEventListener('mousedown', e => e.stopPropagation());
        control.addEventListener('click', e => e.stopPropagation());
        control.addEventListener('dblclick', e => e.stopPropagation());
    });
    const loopNumberBounds = key => {
        if(key === 'loopStart') return {min:1, max:9999};
        if(key === 'imageBatchSize') return {min:1, max:100};
        return {min:1, max:100};
    };
    const normalizeLoopNumber = (key, rawValue) => {
        const bounds = loopNumberBounds(key);
        return Math.max(bounds.min, Math.min(bounds.max, Number(rawValue) || bounds.min));
    };
    const syncLoopNumberUi = (source, key, value) => {
        const control = source?.closest?.('.loop-number-control');
        if(!control) return;
        const display = control.querySelector('.loop-number-trigger strong');
        if(display) display.textContent = value;
        control.querySelectorAll('[data-loop-value]').forEach(cell => {
            cell.classList.toggle('active', Number(cell.dataset.loopValue) === value);
        });
    };
    const setLoopNumber = (key, rawValue, rerender=true, source=null) => {
        const value = normalizeLoopNumber(key, rawValue);
        if(key === 'count') node.count = smartLoopCount({count:value});
        if(key === 'loopStart') node.loopStart = value;
        if(key === 'imageBatchSize') node.imageBatchSize = value;
        scheduleSave();
        if(rerender) render();
        else syncLoopNumberUi(source, key, value);
    };
    el.querySelectorAll('[data-loop-number]').forEach(btn => {
        btn.onclick = e => {
            e.preventDefault();
            e.stopPropagation();
            setLoopNumber(btn.dataset.loopNumber, btn.dataset.loopValue, true);
        };
    });
    el.querySelectorAll('[data-loop-number-input]').forEach(input => {
        input.oninput = e => {
            e.stopPropagation();
            setLoopNumber(input.dataset.loopNumberInput, input.value, false, input);
        };
        input.onchange = e => {
            e.stopPropagation();
            setLoopNumber(input.dataset.loopNumberInput, input.value, true);
        };
    });
    el.querySelectorAll('[data-loop-mode]').forEach(btn => {
        btn.onclick = e => {
            e.preventDefault();
            e.stopPropagation();
            node.mode = btn.dataset.loopMode === 'parallel' ? 'parallel' : 'serial';
            render();
            scheduleSave();
        };
    });
    el.querySelectorAll('[data-loop-toggle]').forEach(btn => {
        btn.onclick = e => {
            e.preventDefault();
            e.stopPropagation();
            if(btn.dataset.loopToggle === 'image') node.imageInput = !node.imageInput;
            if(btn.dataset.loopToggle === 'prompt') {
                node.showPrompt = !node.showPrompt;
                if(node.showPrompt && !smartLoopActivePromptFieldValues(node).length) setSmartLoopPromptFieldValues(node, [tr('smart.loopDefaultPrompt') || '现在生成第《计数》张卖点图片']);
            }
            fitSmartLoopNode(node);
            render();
            scheduleSave();
        };
    });
    const syncPromptFieldsFromDom = () => {
        const values = [...el.querySelectorAll('[data-loop-prompt-index]')]
            .sort((a, b) => Number(a.dataset.loopPromptIndex) - Number(b.dataset.loopPromptIndex))
            .map(input => smartLoopEditorText(input));
        setSmartLoopPromptFieldValues(node, values);
    };
    let activePromptEditor = null;
    el.querySelectorAll('.loop-smart-text').forEach(text => {
        bindScrollableText(text);
        text.onfocus = () => { activePromptEditor = text; };
        text.oninput = () => { syncPromptFieldsFromDom(); scheduleSave(); };
        text.addEventListener('click', e => {
            const remove = e.target.closest?.('.loop-smart-token-chip button');
            if(!remove) return;
            e.preventDefault();
            e.stopPropagation();
            remove.closest('.loop-smart-token-chip')?.remove();
            syncPromptFieldsFromDom();
            scheduleSave();
        });
    });
    el.querySelectorAll('[data-loop-prompt-add]').forEach(btn => {
        btn.onclick = e => {
            e.preventDefault();
            e.stopPropagation();
            syncPromptFieldsFromDom();
            const values = smartLoopPromptFieldValues(node);
            setSmartLoopPromptFieldValues(node, [...values, '']);
            fitSmartLoopNode(node);
            render();
            scheduleSave();
        };
    });
    el.querySelectorAll('[data-loop-prompt-delete]').forEach(btn => {
        btn.onclick = e => {
            e.preventDefault();
            e.stopPropagation();
            syncPromptFieldsFromDom();
            const removeIndex = Number(btn.dataset.loopPromptDelete);
            const values = smartLoopPromptFieldValues(node);
            if(values.length <= 1) return;
            values.splice(removeIndex, 1);
            setSmartLoopPromptFieldValues(node, values);
            fitSmartLoopNode(node);
            render();
            scheduleSave();
        };
    });
    const firstText = el.querySelector('.loop-smart-text');
    const targetPromptEditor = () => activePromptEditor && el.contains(activePromptEditor) ? activePromptEditor : firstText;
    el.querySelectorAll('[data-loop-token]').forEach(btn => {
        btn.onclick = e => {
            e.preventDefault();
            e.stopPropagation();
            const text = targetPromptEditor();
            if(!text) return;
            const token = btn.dataset.loopToken || '《计数》';
            insertSmartLoopToken(text, token);
            syncPromptFieldsFromDom();
            scheduleSave();
        };
    });
    el.querySelectorAll('[data-loop-run]').forEach(btn => {
        btn.onclick = e => {
            e.preventDefault();
            e.stopPropagation();
            const loopId = btn.dataset.loopRun || node.id;
            if(smartCascadeIsLoopRunning(loopId)){
                requestSmartCascadeStop(loopId);
                return;
            }
            runSmartCascadeFromLoop(loopId);
        };
    });
}
function bindScrollableText(el){
    if(!el || el.dataset.scrollBound === '1') return;
    el.dataset.scrollBound = '1';
    const stop = e => e.stopPropagation();
    const beginSelection = e => {
        e.stopPropagation();
        textSelectionGuard = {
            el,
            scrollTop:el.scrollTop || 0,
            scrollLeft:el.scrollLeft || 0,
            clientY:e.clientY,
            wheelUntil:0,
            active:true
        };
    };
    el.addEventListener('mousedown', beginSelection);
    el.addEventListener('mousemove', e => {
        e.stopPropagation();
        if(textSelectionGuard?.el === el) textSelectionGuard.clientY = e.clientY;
    });
    el.addEventListener('mouseup', e => {
        e.stopPropagation();
        if(textSelectionGuard?.el === el) textSelectionGuard.active = false;
    });
    el.addEventListener('mouseleave', e => {
        e.stopPropagation();
        if(textSelectionGuard?.el === el) {
            el.scrollTop = textSelectionGuard.scrollTop;
            el.scrollLeft = textSelectionGuard.scrollLeft;
        }
    });
    el.addEventListener('scroll', () => {
        const guard = textSelectionGuard;
        if(!guard || guard.el !== el || !guard.active || Date.now() < guard.wheelUntil) {
            if(guard?.el === el) {
                guard.scrollTop = el.scrollTop || 0;
                guard.scrollLeft = el.scrollLeft || 0;
            }
            return;
        }
        const nextTop = el.scrollTop || 0;
        const prevTop = guard.scrollTop || 0;
        const rect = el.getBoundingClientRect();
        const pointerBelow = Number.isFinite(guard.clientY) && guard.clientY > rect.bottom - 10;
        const pointerAbove = Number.isFinite(guard.clientY) && guard.clientY < rect.top + 10;
        const jumpedToTop = prevTop > Math.max(80, el.clientHeight * 0.45) && nextTop < 4 && !pointerAbove;
        const wrongDirectionJump = pointerBelow && nextTop < prevTop - Math.max(40, el.clientHeight * 0.25);
        if(jumpedToTop || wrongDirectionJump) {
            requestAnimationFrame(() => {
                if(textSelectionGuard?.el === el && textSelectionGuard.active) {
                    el.scrollTop = prevTop;
                    el.scrollLeft = guard.scrollLeft || 0;
                }
            });
            return;
        }
        guard.scrollTop = nextTop;
        guard.scrollLeft = el.scrollLeft || 0;
    }, {passive:true});
    el.addEventListener('click', stop);
    el.addEventListener('dblclick', stop);
    el.addEventListener('wheel', e => {
        if(document.activeElement === el) e.stopPropagation();
        if(textSelectionGuard?.el === el) textSelectionGuard.wheelUntil = Date.now() + 180;
    }, {passive:true});
}
function updatePortDragVisual(){
    if(!portDragState) return;
    const fromNode = nodes.find(n => n.id === portDragState.fromId);
    if(!fromNode) return;
    const fr = nodeRect(fromNode);
    const isOut = portDragState.fromPort === 'out';
    const fx = isOut ? fr.x + fr.width : fr.x;
    const fy = fr.y + fr.height / 2;
    const tx = portDragState.currentWorld.x;
    const ty = portDragState.currentWorld.y;
    const dx = Math.max(50, Math.abs(tx - fx) * 0.45);
    const sign = isOut ? 1 : -1;
    const path = ensurePortDragPathElement();
    if(path) path.setAttribute('d', `M${fx} ${fy} C ${fx + dx * sign} ${fy}, ${tx - dx * sign} ${ty}, ${tx} ${ty}`);
    world.querySelectorAll('.node-port.is-active').forEach(el => el.classList.remove('is-active'));
    world.querySelectorAll('.image-node.port-hover').forEach(el => el.classList.remove('port-hover'));
    if(portDragState.hoverTargetId){
        const targetNodeEl = world.querySelector(`.image-node[data-id="${portDragState.hoverTargetId}"]`);
        targetNodeEl?.classList.add('port-hover');
        targetNodeEl?.querySelector(`.node-port[data-port="${portDragState.hoverPort}"]`)?.classList.add('is-active');
    }
}
function handlePortDrop(drag, e){
    const {targetId, targetPort, hit} = (() => {
        const hitEl = document.elementFromPoint(e.clientX, e.clientY);
        const portEl = hitEl?.closest?.('.node-port');
        const nodeEl = portEl?.closest?.('.image-node') || hitEl?.closest?.('.image-node');
        let id = '', port = '';
        if(nodeEl && nodeEl.dataset.id && nodeEl.dataset.id !== drag.fromId){
            id = nodeEl.dataset.id;
            if(portEl){
                port = portEl.dataset.port;
            } else {
                const rect = nodeEl.getBoundingClientRect();
                port = (e.clientX - rect.left) < rect.width / 2 ? 'in' : 'out';
            }
        }
        return {targetId:id, targetPort:port, hit:hitEl};
    })();
    if(targetId){
        const compatible = (drag.fromPort === 'out' && targetPort === 'in') || (drag.fromPort === 'in' && targetPort === 'out');
        if(!compatible){ discardPendingUndo(); render(); return; }
        const fromId = drag.fromPort === 'out' ? drag.fromId : targetId;
        const toId = drag.fromPort === 'out' ? targetId : drag.fromId;
        if(connectInputNode(fromId, toId)){
            commitPendingUndo();
            render();
            scheduleSave();
        } else {
            discardPendingUndo();
            render();
        }
        return;
    }
    if(!drag.moved){ discardPendingUndo(); render(); return; }
    if(hit?.closest?.('.composer,.smart-back,.asset-panel,.asset-toggle,.smart-log-toggle,.smart-shortcut-toggle,.log-modal,.shortcut-modal,.image-edit-modal,.smart-minimap')){
        discardPendingUndo(); render(); return;
    }
    const p = screenToWorld(e);
    undoSuppressed = true;
    const newNode = createImageNodeAt(p, [], {select:true, skipUndo:true});
    undoSuppressed = false;
    const fromId = drag.fromPort === 'out' ? drag.fromId : newNode.id;
    const toId = drag.fromPort === 'out' ? newNode.id : drag.fromId;
    connectInputNode(fromId, toId);
    commitPendingUndo();
    render();
    scheduleSave();
}
function pickMediaForSmartNode(nodeId){
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,audio/*';
    input.multiple = true;
    input.onchange = () => {
        if(input.files?.length) handleFiles(input.files, nodeId);
        input.remove();
    };
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    input.style.top = '-9999px';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.click();
}
function bindSmartGroupControls(el, node){
    if(!isSmartFrameGroup(node)) return;
    const noteEl = el.querySelector('[data-smart-frame-note]');
    if(!noteEl) return;
    bindScrollableText(noteEl);
    ['mousedown','click','dblclick'].forEach(type => {
        noteEl.addEventListener(type, e => e.stopPropagation());
    });
    noteEl.oninput = e => {
        node.groupNote = e.target.value;
        scheduleSave();
    };
}
function bindNodeEvents(){
    world.querySelectorAll('.image-node').forEach(el => {
        const id = el.dataset.id;
        const nodeForControls = nodes.find(n => n.id === id);
        if(nodeForControls?.type === 'smart-prompt') bindPromptNodeControls(el, nodeForControls);
        if(nodeForControls?.type === 'smart-loop') bindLoopNodeControls(el, nodeForControls);
        if(nodeForControls?.type === 'smart-group') bindSmartGroupControls(el, nodeForControls);
        if(nodeForControls?.type === 'smart-group') {
            el.ondblclick = e => {
                e.preventDefault();
                e.stopPropagation();
                selectedId = id;
                selectedIds = [];
                selectedImage = {nodeId:'', index:-1};
                openCreateMenu(e, {groupId:id});
            };
        }
        el.onclick = e => {
            e.stopPropagation();
            if(Date.now() < suppressNodeClickUntil) return;
            const node = nodes.find(n => n.id === id);
            hideRunTimerForNode(node);
            const alreadySelected = selectedId === id && selectedIds.length === 0 && selectedImage.nodeId === '';
            selectedId = id;
            selectedIds = [];
            selectedImage = {nodeId:'', index:-1};
            if(smartCascadeAnyRunning()) smartCascadeSilentSelection = false;
            if(alreadySelected){
                syncSelectionUi();
                updateComposer();
                return;
            }
            render();
        };
        if(nodeForControls?.type !== 'smart-group') el.ondblclick = e => e.stopPropagation();
        const nodeDrop = el.querySelector('.node-drop');
        nodeDrop?.addEventListener('mousedown', e => {
            if(e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
        }, true);
        nodeDrop?.addEventListener('click', e => {
            e.preventDefault(); e.stopPropagation();
            hideRunTimerForNode(nodes.find(n => n.id === id));
            selectedId = id;
            selectedIds = [];
            selectedImage = {nodeId:'', index:-1};
            pendingGroupUploadPoint = null;
            uploadTargetId = id;
            syncSelectionUi();
            updateComposer();
            pickMediaForSmartNode(id);
        });
        el.querySelectorAll('.node-delete').forEach(btn => {
            btn.addEventListener('click', e => {
                e.preventDefault(); e.stopPropagation();
                deleteNodeFromButton(id);
            });
        });
        el.querySelectorAll('[data-smart-node-action]').forEach(btn => {
            btn.addEventListener('mousedown', e => {
                e.preventDefault();
                e.stopPropagation();
            }, true);
            btn.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                runSmartNodeToolbarAction(btn.dataset.nodeId || id, btn.dataset.smartNodeAction);
            });
        });
        el.querySelectorAll('[data-smart-group-action]').forEach(btn => {
            btn.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); }, true);
            btn.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                runSmartGroupToolbarAction(btn.dataset.nodeId || id, btn.dataset.smartGroupAction);
            });
        });
        el.querySelectorAll('[data-jimeng-query]').forEach(btn => {
            btn.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); }, true);
            btn.addEventListener('click', e => {
                e.preventDefault(); e.stopPropagation();
                queryJimengNow(btn.dataset.jimengQuery);
            });
        });
        el.querySelectorAll('[data-image-task-query]').forEach(btn => {
            btn.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); }, true);
            btn.addEventListener('click', e => {
                e.preventDefault(); e.stopPropagation();
                querySmartImageTaskNow(btn.dataset.imageTaskQuery, btn.dataset.taskId);
            });
        });
        el.querySelectorAll('[data-thumb-scroll]').forEach(scroller => {
            scroller.addEventListener('wheel', e => {
                e.stopPropagation();
            }, {passive:false});
        });
        el.querySelectorAll('.image-delete').forEach(btn => {
            btn.addEventListener('click', e => {
                e.preventDefault(); e.stopPropagation();
                deleteImage(id, Number(btn.dataset.imageIndex));
            });
        });
        el.querySelectorAll('.smart-video-play').forEach(btn => {
            btn.addEventListener('mousedown', e => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }, true);
            btn.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                const item = btn.closest('[data-image-index]');
                const targetNodeId = item?.dataset.refNodeId || id;
                const imageIndex = Number(item?.dataset.refImageIndex ?? item?.dataset.imageIndex ?? 0);
                const owner = nodes.find(n => n.id === targetNodeId);
                if(mediaKindForItem(owner?.images?.[imageIndex] || {}) !== 'video') return;
                clearImageClickTimer();
                suppressImageClickUntil = Date.now() + 260;
                hideRunTimerForNode(owner);
                smartActivateVideoPreview(btn);
            }, true);
        });
        el.querySelectorAll('.thumb-item,.image-wrap').forEach(item => {
            const thumbTarget = () => {
                const targetNodeId = item.dataset.refNodeId || id;
                const imageIndex = Number(item.dataset.refImageIndex ?? item.dataset.imageIndex ?? 0);
                const owner = nodes.find(n => n.id === targetNodeId);
                return {targetNodeId, imageIndex, owner, image:owner?.images?.[imageIndex]};
            };
            item.setAttribute('draggable', 'false');
            item.addEventListener('dragstart', e => {
                e.preventDefault();
            });
            item.addEventListener('mousedown', e => {
                if(e.target.closest('video,audio')) return;
                if(e.button !== 0 || e.target.closest('.image-delete')) return;
                if(e.detail < 2) return;
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                clearImageClickTimer();
                suppressImageClickUntil = Date.now() + 260;
                const target = thumbTarget();
                if(mediaKindForItem(target.image || {}) === 'video'){
                    smartActivateVideoPreview(item);
                    return;
                }
                selectedId = id;
                selectedIds = [];
                selectedImage = {nodeId:target.targetNodeId, index:target.imageIndex};
                openImagePreviewSmart(target.targetNodeId, target.imageIndex);
            }, true);
            item.addEventListener('click', e => {
                if(e.target.closest('video,audio')) return;
                if(e.target.closest('.image-delete')) return;
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                if(Date.now() < suppressImageClickUntil) return;
                const target = thumbTarget();
                const owner = nodes.find(n => n.id === id);
                if(mediaKindForItem(target.image || {}) === 'video'){
                    clearImageClickTimer();
                    suppressImageClickUntil = Date.now() + 260;
                    hideRunTimerForNode(target.owner || owner);
                    smartActivateVideoPreview(item);
                    return;
                }
                if(e.detail >= 2){
                    clearImageClickTimer();
                    suppressImageClickUntil = Date.now() + 260;
                    selectedId = id;
                    selectedIds = [];
                    selectedImage = {nodeId:target.targetNodeId, index:target.imageIndex};
                    openImagePreviewSmart(target.targetNodeId, target.imageIndex);
                    return;
                }
                clearImageClickTimer();
                imageClickTimer = setTimeout(() => {
                    imageClickTimer = null;
                hideRunTimerForNode(owner);
                selectedId = id;
                selectedIds = [];
                // Composer 绑定节点本身；这里记录图层焦点，用于交叠时置顶和工具栏目标。
                selectedImage = {nodeId:target.targetNodeId, index:target.imageIndex};
                    if(smartCascadeAnyRunning()) smartCascadeSilentSelection = false;
                    syncSelectionUi();
                    updateComposer();
                }, 220);
            });
        item.addEventListener('dblclick', e => {
            if(e.target.closest('video,audio')) return;
            if(e.target.closest('.image-delete')) return;
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            clearImageClickTimer();
            suppressImageClickUntil = Date.now() + 260;
            const target = thumbTarget();
            if(mediaKindForItem(target.image || {}) === 'video'){
                smartActivateVideoPreview(item);
                return;
            }
            selectedId = id;
            selectedIds = [];
            selectedImage = {nodeId:target.targetNodeId, index:target.imageIndex};
            openImagePreviewSmart(target.targetNodeId, target.imageIndex);
        }, true);
        });
        el.querySelectorAll('.thumb-item,.smart-group-single-thumb').forEach(item => {
            item.addEventListener('mousedown', e => {
                if(e.target.closest('video,audio')) return;
                if(e.button !== 0 || e.target.closest('.mini-x')) return;
                if(e.detail >= 2) return;
                if(!e.altKey) return;
                const node = nodes.find(n => n.id === id);
                const refNodeId = item.dataset.refNodeId || '';
                if(refNodeId && refNodeId !== id) return;
                if(!node) return;
                const imgIndex = Number(item.dataset.imageIndex || 0);
                if(isSmartGroupNode(node)){
                    if(!node.images?.[imgIndex]) return;
                } else if((node.images || []).length <= 1) return;
                e.preventDefault(); e.stopPropagation();
                thumbDragState = {nodeId:id, imgIndex, startX:e.clientX, startY:e.clientY, detached:false};
                capturePendingUndo();
            });
        });
        el.querySelector('.node-resize-handle')?.addEventListener('mousedown', e => {
            if(e.button !== 0) return;
            e.preventDefault(); e.stopPropagation();
            const node = nodes.find(n => n.id === id);
            if(!node) return;
            const rect = nodeRect(node);
            resizeState = {id, startX:e.clientX, startY:e.clientY, startW:rect.width, startH:rect.height};
            // 分组缩放：记录本次手势开始时所有成员的位置/尺寸快照与起始缩放，缩放过程按相对快照的比例实时计算，
            // 整体等比缩放+重排。用快照而非持久基准，移动成员后再缩放也不会回退到旧位置。
            if(isSmartGroupNode(node)){
                resizeState.startZoom = smartGroupZoom(node);
                const gx0 = Number(node.x) || 0, gy0 = Number(node.y) || 0;
                let maxR = gx0, maxB = gy0, hasM = false;
                resizeState.members = smartGroupMembers(node).map(m => {
                    const r = nodeRect(m);
                    const sx = Number(m.x) || 0, sy = Number(m.y) || 0, sw = Number(r.width) || 0, sh = Number(r.height) || 0;
                    hasM = true; maxR = Math.max(maxR, sx + sw); maxB = Math.max(maxB, sy + sh);
                    return {id:m.id, sx, sy, sw, sh, isImage:isSmartImageNode(m)};
                });
                // 记录“贴合内容时的框尺寸”作为缩放映射基准（而不是当前可能含留白的框宽），
                // 这样从放大很多的框往回缩时，框是线性跟随手柄缩小、而不是一下子跳到内容边缘。
                resizeState.contentFitW = hasM ? Math.max(1, maxR - gx0 + 16) : (rect.width || 1);
                resizeState.contentFitH = hasM ? Math.max(1, maxB - gy0 + 16) : (rect.height || 1);
            }
            document.body.classList.add('smart-node-resize');
            capturePendingUndo();
        });
        const beginNodeDrag = e => {
            if(e.button !== 0 || e.target.closest('.mini-x, .smart-node-floating-menu, .node-resize-handle, .node-port, select, input, button')) return;
            if(e.target.closest('.prompt-node-pill, textarea:not(.prompt-node-text)')) return;
            e.preventDefault(); e.stopPropagation();
            window.getSelection?.()?.removeAllRanges?.();
            if(document.activeElement?.blur) document.activeElement.blur();
            let node = nodes.find(n => n.id === id);
            if(!node) return;
            if(e.altKey) node = duplicateForAltDrag(node);
            const selectedForDrag = isNodeSelected(node.id) ? selectedNodeIds() : [node.id];
            let dragIds = expandedDragNodeIds(selectedForDrag);
            const group = dragIds.map(dragId => {
                const n = nodes.find(x => x.id === dragId);
                return n ? {id:n.id, ox:Number(n.x) || 0, oy:Number(n.y) || 0} : null;
            }).filter(Boolean);
            dragState = {id:node.id, startX:e.clientX, startY:e.clientY, ox:node.x || 0, oy:node.y || 0, group, groupIds:group.map(item => item.id), ctrlGroup:Boolean(e.ctrlKey)};
            document.body.classList.add('smart-node-drag');
            capturePendingUndo();
        };
        el.querySelectorAll('.node-port').forEach(port => {
            port.addEventListener('mousedown', e => {
                if(e.button !== 0) return;
                e.preventDefault(); e.stopPropagation();
                const portType = port.dataset.port;
                const p = screenToWorld(e);
                portDragState = {
                    fromId:id,
                    fromPort:portType,
                    currentWorld:p,
                    hoverTargetId:'',
                    hoverPort:'',
                    moved:false
                };
                shell.classList.add('port-dragging');
                capturePendingUndo();
                ensurePortDragPathElement();
                updatePortDragVisual();
            });
            port.addEventListener('click', e => { e.stopPropagation(); });
            port.addEventListener('dblclick', e => { e.stopPropagation(); });
        });
        el.onmousedown = beginNodeDrag;
        el.ondragover = e => setSmartDropCopyEffect(e);
        el.ondrop = async e => {
            e.preventDefault();
            e.stopPropagation();
            const payload = await resolveSmartImageDropPayload(e.dataTransfer);
            if(payload.type === 'none') return;
            await handleSmartImageDropPayload(payload, id);
        };
    });
}
function rectOverlapNode(draggedId, x, y, w, h, excludeIds=[]){
    const cx = x + w/2, cy = y + h/2;
    const excluded = new Set([draggedId, ...(excludeIds || [])]);
    for(const n of nodes){
        if(excluded.has(n.id)) continue;
        const r = nodeRect(n);
        if(cx >= r.x && cx <= r.x + r.width && cy >= r.y && cy <= r.y + r.height) return n;
    }
    return null;
}
function dragConnectTargetFor(sourceNode, point=lastMouseWorld){
    if(!sourceNode || (dragState?.group || []).length > 1) return null;
    if(['smart-prompt', 'smart-loop'].includes(sourceNode.type) && point){
        return rectOverlapNode(sourceNode.id, point.x - 1, point.y - 1, 2, 2, dragState?.groupIds || []);
    }
    const r = nodeRect(sourceNode);
    return rectOverlapNode(sourceNode.id, r.x, r.y, r.width, r.height, dragState?.groupIds || []);
}
function canAutoConnectDraggedNode(sourceNode, targetNode){
    if(!sourceNode || !targetNode || sourceNode.id === targetNode.id) return false;
    if(isHistoryGroupNode(sourceNode) || isHistoryGroupNode(targetNode)) return false;
    if(isSmartGroupNode(targetNode)) return false;
    if(isSmartImageNode(sourceNode)) return isSmartImageNode(targetNode) || targetNode.type === 'smart-loop' || targetNode.type === 'smart-prompt';
    if(sourceNode.type === 'smart-prompt') return isSmartImageNode(targetNode) || targetNode.type === 'smart-loop';
    if(sourceNode.type === 'smart-loop') return isSmartImageNode(targetNode);
    if(sourceNode.type === 'smart-group') return isSmartImageNode(targetNode) || targetNode.type === 'smart-loop';
    return false;
}
function restoreDraggedNodePosition(){
    if(!dragState) return;
    (dragState.group || [{id:dragState.id, ox:dragState.ox, oy:dragState.oy}]).forEach(item => {
        const n = nodes.find(x => x.id === item.id);
        if(n){
            n.x = item.ox;
            n.y = item.oy;
        }
    });
}
function pruneSmartGroupMembershipsForNode(node){
    if(!node || !node.id) return false;
    // 节点拖出分组：从所有分组移除自己（保持当前尺寸，不自动放大）。
    // 分组合并已改为“释放被拖分组、只并入其成员”，所以这里只需处理单个节点的退组。
    let changed = false;
    nodes.forEach(group => {
        if(!isSmartGroupNode(group) || !Array.isArray(group.items) || !group.items.includes(node.id)) return;
        group.items = group.items.filter(id => id !== node.id);
        changed = true;
    });
    return changed;
}
function clearDropHighlight(){
    world.querySelectorAll('.image-node.drop-target').forEach(el => el.classList.remove('drop-target'));
}
function setDropHighlight(targetId){
    clearDropHighlight();
    if(!targetId) return;
    const el = world.querySelector(`.image-node[data-id="${targetId}"]`);
    if(el) el.classList.add('drop-target');
}
function deleteNode(id){
    pushUndo();
    const deleteIds = new Set([id]);
    nodes.forEach(node => {
        if(isHistoryGroupNode(node) && node.historyFor === id) deleteIds.add(node.id);
    });
    const deletedAt = Date.now();
    deleteIds.forEach(nodeId => deletedSmartNodeTombstones.set(nodeId, deletedAt));
    nodes.filter(node => deleteIds.has(node.id)).forEach(cancelSmartNodeTasks);
    nodes = nodes.filter(node => !deleteIds.has(node.id));
    if(canvas) canvas.connections = (canvas.connections || []).filter(c => !deleteIds.has(c.from) && !deleteIds.has(c.to));
    nodes.forEach(node => {
        if(Array.isArray(node.inputNodeIds)) node.inputNodeIds = node.inputNodeIds.filter(inputId => !deleteIds.has(inputId));
        if(isSmartGroupNode(node) && Array.isArray(node.items)) node.items = node.items.filter(itemId => !deleteIds.has(itemId));
    });
    if(selectedId === id) selectedId = '';
    selectedIds = selectedIds.filter(selected => !deleteIds.has(selected));
    if(deleteIds.has(selectedImage.nodeId)) selectedImage = {nodeId:'', index:-1};
    render();
    scheduleSave();
}
function deleteSelectedNodes(){
    const ids = selectedNodeIds();
    if(!ids.length){ toast('请先选择要删除的节点'); return false; }
    pushUndo();
    ids.forEach(id => {
        undoSuppressed = true;
        deleteNode(id);
        undoSuppressed = false;
    });
    selectedId = '';
    selectedIds = [];
    selectedImage = {nodeId:'', index:-1};
    render();
    scheduleSave();
    toast('已删除选中节点');
    return true;
}
function clearNodeMediaBeforeDelete(id){
    const node = nodes.find(n => n.id === id);
    if(!node || (node.type && node.type !== 'smart-image')) return false;
    const hadMedia = Boolean((node.images || []).length || node.pending);
    if(!hadMedia) return false;
    pushUndo();
    cancelSmartNodeTasks(node);
    node.images = [];
    node.clearedAt = Date.now();
    node.pending = 0;
    node.running = false;
    delete node.pendingTasks;
    delete node.jimengPending;
    node.title = tr('smart.createImportNode');
    delete node.w;
    delete node.h;
    const history = historyGroupForNode(node);
    if(history){
        deletedSmartNodeTombstones.set(history.id, Date.now());
        nodes = nodes.filter(n => n.id !== history.id);
        if(canvas) canvas.connections = (canvas.connections || []).filter(c => c.from !== history.id && c.to !== history.id);
    }
    if(selectedImage.nodeId === id) selectedImage = {nodeId:'', index:-1};
    selectedId = id;
    selectedIds = [];
    render();
    scheduleSave();
    return true;
}
function deleteNodeFromButton(id){
    const node = nodes.find(n => n.id === id);
    if(node && isGeneratedSmartOutputNode(node)) {
        deleteNode(id);
        return;
    }
    if(clearNodeMediaBeforeDelete(id)) return;
    deleteNode(id);
}
function disconnectConnection(index){
    disconnectConnections([index]);
}
// 断开一条或多条连线（合并到分组的连线会一次性断开其下所有成员连线）。spec 可为索引数组或逗号分隔字符串。
function disconnectConnections(spec){
    if(!canvas || !Array.isArray(canvas.connections)) return;
    const indices = (Array.isArray(spec) ? spec : String(spec).split(','))
        .map(v => Number(v))
        .filter(n => Number.isInteger(n) && n >= 0 && n < canvas.connections.length);
    if(!indices.length) return;
    const set = new Set(indices);
    const removed = canvas.connections.filter((_, i) => set.has(i));
    if(!removed.length) return;
    pushUndo();
    canvas.connections = canvas.connections.filter((_, i) => !set.has(i));
    removed.forEach(conn => {
        const toNode = nodes.find(n => n.id === conn.to);
        if(toNode && Array.isArray(toNode.inputNodeIds)){
            toNode.inputNodeIds = toNode.inputNodeIds.filter(id => id !== conn.from);
        }
        if(toNode && ['input','flow'].includes(conn.kind || 'flow')) clearDetachedRunInputRefs(toNode);
        if((conn.kind || 'flow') === 'history'){
            const group = nodes.find(n => n.id === conn.to && isHistoryGroupNode(n) && n.historyFor === conn.from);
            demoteHistoryGroupNode(group);
        }
    });
    render();
    scheduleSave();
}
function connectionMidpoint(conn){
    const fromNode = nodes.find(n => n.id === conn?.from);
    const toNode = nodes.find(n => n.id === conn?.to);
    if(!fromNode || !toNode) return null;
    const fr = nodeRect(fromNode), tr = nodeRect(toNode);
    if((conn.kind || 'flow') === 'history'){
        return {x:(fr.x + fr.width / 2 + tr.x + tr.width / 2) / 2, y:(fr.y + fr.height + tr.y) / 2};
    }
    return {x:(fr.x + fr.width + tr.x) / 2, y:(fr.y + fr.height / 2 + tr.y + tr.height / 2) / 2};
}
function insertionConnectionForNode(node){
    if(!node || node.type !== 'smart-loop' || !canvas?.connections?.length) return null;
    const r = nodeRect(node);
    const cx = (Number(r.x) || 0) + (Number(r.width) || 0) / 2;
    const cy = (Number(r.y) || 0) + (Number(r.height) || 0) / 2;
    let best = null;
    (canvas.connections || []).forEach((conn, index) => {
        const kind = conn.kind || 'flow';
        if(!['input','flow'].includes(kind)) return;
        if(conn.from === node.id || conn.to === node.id) return;
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        if(!fromNode || !toNode || isHistoryGroupNode(fromNode) || isHistoryGroupNode(toNode)) return;
        const mid = connectionMidpoint(conn);
        if(!mid) return;
        const score = Math.hypot(cx - mid.x, cy - mid.y);
        if(score > 96) return;
        if(!best || score < best.score) best = {conn, index, score};
    });
    return best;
}
function insertLoopNodeIntoConnection(loopNode, hit){
    if(!loopNode || loopNode.type !== 'smart-loop' || !hit?.conn) return false;
    const conn = hit.conn;
    const kind = conn.kind || 'flow';
    canvas.connections = (canvas.connections || []).filter((c, index) => index !== hit.index);
    nodes.forEach(n => {
        if(Array.isArray(n.inputNodeIds)) n.inputNodeIds = n.inputNodeIds.filter(id => !(n.id === conn.to && id === conn.from));
    });
    addConnection(conn.from, loopNode.id, kind === 'flow' ? 'flow' : 'input');
    connectInputNode(loopNode.id, conn.to);
    return true;
}
function updateLoopInsertPreview(){
    const node = dragState ? nodes.find(n => n.id === dragState.id) : null;
    const next = node?.type === 'smart-loop' && dragState.ctrlGroup && (dragState.group || []).length <= 1
        ? insertionConnectionForNode(node)
        : null;
    const nextPreview = next ? {index:next.index} : null;
    const changed = (loopInsertPreview?.index ?? -1) !== (nextPreview?.index ?? -1);
    loopInsertPreview = nextPreview;
    if(changed) scheduleConnectionLayerRefresh();
    return next;
}
function deleteImage(id, imageIndex){
    const node = nodes.find(n => n.id === id);
    if(!node || imageIndex < 0) return;
    pushUndo();
    node.images = (node.images || []).filter((_, index) => index !== imageIndex);
    if(node.images.length <= 1) node.title = 'Image';
    if(selectedImage.nodeId === id) selectedImage = {nodeId:id, index:Math.min(selectedImage.index, node.images.length - 1)};
    if(selectedImage.index < 0) selectedImage = {nodeId:'', index:-1};
    render();
    scheduleSave();
}
function currentEditImage(){
    const node = nodes.find(n => n.id === cropState?.nodeId);
    const index = Number(cropState?.imageIndex || 0);
    return {node, index, image:imageForDisplay(node?.images?.[index])};
}
function cropImageDisplaySize(){
    const img = document.getElementById('cropImage');
    const clientW = Number(img?.clientWidth || 0);
    const clientH = Number(img?.clientHeight || 0);
    if(clientW > 2 && clientH > 2) return {w:clientW, h:clientH};
    ensureImageEditBaseSize();
    const fallbackW = Math.round((imageEditBaseW || Number(img?.naturalWidth || 0) || 1) * imageEditZoom);
    const fallbackH = Math.round((imageEditBaseH || Number(img?.naturalHeight || 0) || 1) * imageEditZoom);
    return {w:Math.max(1, fallbackW), h:Math.max(1, fallbackH)};
}
function cropBounds(){
    return cropImageDisplaySize();
}
function editDrawCanvas(){ return document.getElementById('editDrawCanvas'); }
function editTextCanvas(){ return document.getElementById('editTextCanvas'); }
function editTextContext(){ return editTextCanvas()?.getContext('2d') || null; }
function selectedEditTextItem(){ return editTextItems.find(item => item.id === editTextSelectedId) || null; }
function defaultEditTextText(){ return window.StudioI18n?.lang?.() === 'en' ? 'Double-click to edit' : '双击编辑'; }
function editTextSizeFromBrush(){ return Math.max(14, Math.min(120, Math.round(editBrushSize() * 2))); }
function createEditTextItem(text, point, preset={}){
    const size = Math.max(10, Math.min(120, Number(preset.size) || editTextSizeFromBrush()));
    return {id:uid('txt'), text:String(text || defaultEditTextText()).trim(), x:Number(point?.x || 0), y:Number(point?.y || 0), color:preset.color || brushColor(), size};
}
function textItemFont(item){
    const size = Math.max(10, Math.min(120, Number(item?.size) || 28));
    return `900 ${size}px Arial, sans-serif`;
}
function measureEditTextItem(item, ctx=editTextContext()){
    if(!item || !ctx) return {x:0, y:0, w:0, h:0};
    const size = Math.max(10, Math.min(120, Number(item.size) || 28));
    ctx.save();
    ctx.font = textItemFont(item);
    const metrics = ctx.measureText(String(item.text || ''));
    ctx.restore();
    const width = Math.max(1, metrics.width || 1);
    const ascent = Number.isFinite(metrics.actualBoundingBoxAscent) ? metrics.actualBoundingBoxAscent : size * 0.8;
    const descent = Number.isFinite(metrics.actualBoundingBoxDescent) ? metrics.actualBoundingBoxDescent : size * 0.25;
    const pad = Math.max(4, Math.round(size * 0.18));
    return {x:item.x - width / 2 - pad, y:item.y - (ascent + descent) / 2 - pad, w:width + pad * 2, h:ascent + descent + pad * 2, textW:width, textH:ascent + descent, pad};
}
function hitEditTextItem(point){
    const ctx = editTextContext();
    if(!ctx) return null;
    for(let i = editTextItems.length - 1; i >= 0; i--){
        const item = editTextItems[i];
        const box = measureEditTextItem(item, ctx);
        if(point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h) return item;
    }
    return null;
}
function renderEditTextCanvas(){
    const canvasEl = editTextCanvas();
    const ctx = editTextContext();
    if(!canvasEl || !ctx) return;
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    editTextItems.forEach(item => {
        if(!item?.text) return;
        const selected = item.id === editTextSelectedId;
        const box = measureEditTextItem(item, ctx);
        ctx.save();
        ctx.font = textItemFont(item);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = item.color || brushColor();
        ctx.strokeStyle = 'rgba(255,255,255,.92)';
        ctx.lineWidth = Math.max(2, (Number(item.size) || 28) / 8);
        ctx.strokeText(String(item.text || ''), item.x, item.y);
        ctx.fillText(String(item.text || ''), item.x, item.y);
        if(selected){
            ctx.setLineDash([7, 5]);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(15,23,42,.72)';
            ctx.strokeRect(box.x, box.y, box.w, box.h);
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(15,23,42,.92)';
            ctx.beginPath();
            ctx.arc(item.x + box.w / 2 - box.pad, item.y - box.h / 2 + box.pad, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    });
    positionEditTextInlineEditor();
}
function syncTextToolState(force=false){
    const cropCanvasEl = document.getElementById('cropCanvas');
    cropCanvasEl?.classList.toggle('text-mode', imageEditMode === 'brush' && brushTool === 'text');
}
function syncSelectedEditTextStyleFromBrush(){
    if(imageEditMode !== 'brush' || brushTool !== 'text' || editTextInlineEditor) return;
    const item = selectedEditTextItem();
    if(!item) return;
    const nextSize = editTextSizeFromBrush();
    const nextColor = brushColor();
    if(item.size === nextSize && item.color === nextColor) return;
    beginTextEditChange();
    item.size = nextSize;
    item.color = nextColor;
    renderEditTextCanvas();
    syncTextToolState(true);
}
function beginTextEditChange(){
    if(editTextDirty) return;
    pushEditDrawHistory();
    editTextDirty = true;
}
function setSelectedEditTextItem(id){
    editTextSelectedId = id || '';
    renderEditTextCanvas();
    syncTextToolState(true);
}
function confirmSelectedEditTextItem(){
    const selected = selectedEditTextItem();
    if(!selected) return false;
    if(!String(selected.text || '').trim()) editTextItems = editTextItems.filter(item => item.id !== selected.id);
    editTextSelectedId = '';
    editTextDrag = null;
    editTextDirty = false;
    renderEditTextCanvas();
    syncTextToolState(true);
    return true;
}
function editTextCanvasScale(){
    const canvasEl = editTextCanvas();
    const rect = canvasEl?.getBoundingClientRect?.();
    return {x:(rect?.width || canvasEl?.width || 1) / Math.max(1, canvasEl?.width || 1), y:(rect?.height || canvasEl?.height || 1) / Math.max(1, canvasEl?.height || 1), rect};
}
function selectInlineEditorText(el){
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}
function inlineEditorText(){
    return String(editTextInlineEditor?.el?.innerText || editTextInlineEditor?.el?.textContent || '').replace(/\u00a0/g, ' ');
}
function autosizeEditTextInlineEditor(){
    const editor = editTextInlineEditor;
    if(!editor?.el) return;
    const el = editor.el;
    el.style.width = 'auto';
    el.style.height = 'auto';
    el.style.width = `${Math.max(Number(editor.minW || 48), el.scrollWidth + 10)}px`;
    el.style.height = `${Math.max(Number(editor.minH || 28), el.scrollHeight + 4)}px`;
}
function positionEditTextInlineEditor(){
    const editor = editTextInlineEditor;
    if(!editor?.el) return;
    const item = editTextItems.find(x => x.id === editor.itemId);
    const canvasEl = editTextCanvas();
    const cropCanvasEl = document.getElementById('cropCanvas');
    if(!item || !canvasEl || !cropCanvasEl) return;
    const box = measureEditTextItem(item, editTextContext());
    const scale = editTextCanvasScale();
    const hostRect = cropCanvasEl.getBoundingClientRect();
    const canvasRect = scale.rect || canvasEl.getBoundingClientRect();
    const left = canvasRect.left - hostRect.left + box.x * scale.x;
    const top = canvasRect.top - hostRect.top + box.y * scale.y;
    const w = Math.max(48, box.w * scale.x);
    const h = Math.max(28, box.h * scale.y);
    editor.minW = w;
    editor.minH = h;
    editor.el.style.left = `${left}px`;
    editor.el.style.top = `${top}px`;
    editor.el.style.minWidth = `${w}px`;
    editor.el.style.minHeight = `${h}px`;
    editor.el.style.font = `900 ${Math.max(10, (Number(item.size) || 28) * scale.y)}px Arial, sans-serif`;
    editor.el.style.color = item.color || brushColor();
    autosizeEditTextInlineEditor();
}
function removeEditTextInlineEditor(commit=true){
    const editor = editTextInlineEditor;
    if(!editor) return;
    const item = editTextItems.find(x => x.id === editor.itemId);
    const next = inlineEditorText().trim();
    editTextInlineEditor = null;
    editor.el.remove();
    if(!item) return;
    if(commit){
        if(next !== String(editor.before || '')){
            beginTextEditChange();
            if(next) item.text = next;
            else {
                editTextItems = editTextItems.filter(x => x.id !== item.id);
                editTextSelectedId = '';
            }
        }
    } else {
        item.text = editor.before || item.text || defaultEditTextText();
    }
    editTextDirty = false;
    renderEditTextCanvas();
    syncTextToolState(true);
}
function beginEditTextInline(item){
    if(!item) return;
    removeEditTextInlineEditor(true);
    editTextSelectedId = item.id;
    const host = document.getElementById('cropCanvas');
    if(!host) return;
    const el = document.createElement('div');
    el.className = 'edit-text-inline';
    el.contentEditable = 'true';
    el.spellcheck = false;
    el.textContent = item.text || defaultEditTextText();
    host.appendChild(el);
    editTextInlineEditor = {el, itemId:item.id, before:item.text || ''};
    positionEditTextInlineEditor();
    el.addEventListener('input', autosizeEditTextInlineEditor);
    el.addEventListener('keydown', event => {
        if(event.key === 'Enter' && !event.shiftKey){ event.preventDefault(); removeEditTextInlineEditor(true); }
        else if(event.key === 'Escape'){ event.preventDefault(); removeEditTextInlineEditor(false); }
    });
    el.addEventListener('blur', () => removeEditTextInlineEditor(true));
    requestAnimationFrame(() => { el.focus(); selectInlineEditorText(el); });
    renderEditTextCanvas();
    syncTextToolState(true);
}
function editTextPoint(event){ return editDrawPoint(event); }
function beginEditText(event){
    if(imageEditMode !== 'brush' || brushTool !== 'text') return;
    event.preventDefault(); event.stopPropagation();
    removeEditTextInlineEditor(true);
    const canvasEl = editTextCanvas();
    const point = editTextPoint(event);
    const hit = hitEditTextItem(point);
    if(hit){
        editTextSelectedId = hit.id;
        editTextDrag = {id:hit.id, pointerId:event.pointerId, startX:hit.x, startY:hit.y, sx:event.clientX, sy:event.clientY, moved:false, hasHistory:false};
        canvasEl.setPointerCapture?.(event.pointerId);
        canvasEl.style.cursor = 'grabbing';
        syncTextToolState(true);
        renderEditTextCanvas();
        return;
    }
    if(selectedEditTextItem()){
        confirmSelectedEditTextItem();
        return;
    }
    beginTextEditChange();
    const item = createEditTextItem(defaultEditTextText(), point, {color:brushColor(), size:editTextSizeFromBrush()});
    editTextItems.push(item);
    editTextSelectedId = item.id;
    canvasEl.style.cursor = 'text';
    renderEditTextCanvas();
    syncTextToolState(true);
}
function updateEditTextCursor(event){
    const canvasEl = editTextCanvas();
    if(!canvasEl || imageEditMode !== 'brush' || brushTool !== 'text') return;
    const hit = hitEditTextItem(editTextPoint(event));
    canvasEl.style.cursor = hit ? 'move' : 'text';
}
function moveEditText(event){
    if(!editTextDrag){
        updateEditTextCursor(event);
        return;
    }
    event.preventDefault(); event.stopPropagation();
    const item = editTextItems.find(x => x.id === editTextDrag.id);
    if(!item) return;
    const dx = event.clientX - editTextDrag.sx;
    const dy = event.clientY - editTextDrag.sy;
    if(!editTextDrag.moved && Math.abs(dx) + Math.abs(dy) < 2) return;
    editTextDrag.moved = true;
    if(!editTextDrag.hasHistory){
        beginTextEditChange();
        editTextDrag.hasHistory = true;
    }
    const canvasEl = editTextCanvas();
    const rect = canvasEl?.getBoundingClientRect?.();
    const scaleX = canvasEl ? canvasEl.width / Math.max(1, rect?.width || canvasEl.width) : 1;
    const scaleY = canvasEl ? canvasEl.height / Math.max(1, rect?.height || canvasEl.height) : 1;
    item.x = editTextDrag.startX + dx * scaleX;
    item.y = editTextDrag.startY + dy * scaleY;
    renderEditTextCanvas();
}
function endEditText(event){
    if(editTextDrag && event?.pointerId != null) editTextCanvas()?.releasePointerCapture?.(event.pointerId);
    editTextDrag = null;
    editTextDirty = false;
    renderEditTextCanvas();
    syncTextToolState(true);
    if(event) updateEditTextCursor(event);
}
function editTextHasContent(){ return editTextItems.some(item => String(item?.text || '').trim().length > 0); }
function resizeEditTextCanvas(){
    const img = document.getElementById('cropImage');
    const canvasEl = editTextCanvas();
    if(!img || !canvasEl) return;
    const display = cropImageDisplaySize();
    const w = Math.max(1, img.naturalWidth || img.clientWidth || 1);
    const h = Math.max(1, img.naturalHeight || img.clientHeight || 1);
    if(canvasEl.width !== w) canvasEl.width = w;
    if(canvasEl.height !== h) canvasEl.height = h;
    canvasEl.style.width = `${display.w}px`;
    canvasEl.style.height = `${display.h}px`;
    renderEditTextCanvas();
}
function resizeEditDrawCanvas(){
    const img = document.getElementById('cropImage');
    const canvasEl = editDrawCanvas();
    const display = cropImageDisplaySize();
    const w = Math.max(1, img.naturalWidth || img.clientWidth || 1);
    const h = Math.max(1, img.naturalHeight || img.clientHeight || 1);
    if(canvasEl.width !== w || canvasEl.height !== h){ canvasEl.width = w; canvasEl.height = h; }
    canvasEl.style.width = `${display.w}px`;
    canvasEl.style.height = `${display.h}px`;
    resizeEditTextCanvas();
    if(imageEditMode === 'grid') refreshGridSplitPreview();
}
function setImageEditMode(mode, userTouched=false){
    const editKind = mediaKindForItem(currentEditImage().image || {});
    const isVideoPreview = editKind === 'video';
    if(isVideoPreview && mode !== 'preview') mode = 'preview';
    if(userTouched) imageEditModeTouched = true;
    const prev = imageEditMode;
    if(mode !== 'brush') removeEditTextInlineEditor(true);
    imageEditMode = ['preview','crop','outpaint','mask','brush','grid'].includes(mode) ? mode : 'preview';
    const cropCanvasEl = document.getElementById('cropCanvas');
    const previewStageEl = document.getElementById('previewStage');
    const editStageEl = document.getElementById('imageEditStage');
    const editPanelEl = document.querySelector('.image-edit-panel');
    const previewDownloadBtn = document.getElementById('previewDownloadBtn');
    const previewDownloadAllBtn = document.getElementById('previewDownloadAllBtn');
    const modeBar = document.querySelector('.image-edit-mode');
    const videoFrameTools = document.getElementById('videoFrameTools');
    const zoomLabel = document.getElementById('imageEditZoomLabel');
    const cancelBtn = document.getElementById('imageEditCancelBtn');
    const isPreview = imageEditMode === 'preview';
    if(!isPreview && panoramaState.enabled) disposePanoramaPreview();
    cropCanvasEl.style.display = isPreview ? 'none' : '';
    previewStageEl.style.display = isPreview ? 'inline-flex' : 'none';
    editStageEl?.classList.toggle('preview-mode', isPreview);
    editPanelEl?.classList.toggle('video-preview-mode', isVideoPreview);
    if(previewDownloadBtn) previewDownloadBtn.style.display = isPreview ? 'inline-flex' : 'none';
    if(previewDownloadAllBtn) previewDownloadAllBtn.style.display = isPreview && !isVideoPreview && previewDownloadGroupItems().length > 1 ? 'inline-flex' : 'none';
    if(modeBar) modeBar.style.display = isVideoPreview ? 'none' : '';
    if(videoFrameTools) videoFrameTools.style.display = isVideoPreview && isPreview ? 'flex' : 'none';
    if(zoomLabel) zoomLabel.style.display = isVideoPreview ? 'none' : '';
    if(cancelBtn){
        cancelBtn.style.display = '';
        cancelBtn.textContent = isVideoPreview ? '关闭' : tr('common.cancel');
    }
    cropCanvasEl.classList.toggle('mask-mode', imageEditMode === 'mask');
    cropCanvasEl.classList.toggle('brush-mode', imageEditMode === 'brush');
    cropCanvasEl.classList.toggle('grid-mode', imageEditMode === 'grid');
    cropCanvasEl.classList.toggle('outpaint-mode', imageEditMode === 'outpaint');
    syncGridCustomCursor();
    document.querySelectorAll('[data-image-edit-mode]').forEach(btn => btn.classList.toggle('active', btn.dataset.imageEditMode === imageEditMode));
    document.getElementById('imagePreviewTools').classList.toggle('active', isPreview && !isVideoPreview);
    document.getElementById('imageMaskTools').classList.toggle('active', imageEditMode === 'mask');
    document.getElementById('imageBrushTools').classList.toggle('active', imageEditMode === 'brush');
    document.getElementById('imageGridTools').classList.toggle('active', imageEditMode === 'grid');
    if(imageEditMode === 'grid' && gridOperationMode === 'join' && !canGridJoinCurrentNode()) gridOperationMode = 'split';
    syncGridOperationControls();
    syncGridGapValue();
    const applyBtn = document.getElementById('imageEditApplyBtn');
    document.getElementById('compareToggleBtn').style.display = isPreview && !isVideoPreview ? 'inline-flex' : 'none';
    document.getElementById('panoramaToggleBtn').style.display = isPreview && !isVideoPreview ? 'inline-flex' : 'none';
    document.getElementById('panoramaExportBtn').style.display = isPreview && !isVideoPreview && panoramaState.enabled ? 'inline-flex' : 'none';
    document.getElementById('compareThumbs').style.display = 'none';
    if(isPreview){
        document.getElementById('imageEditTitle').textContent = isVideoPreview ? '预览视频' : tr('smart.previewImage');
        document.getElementById('imageEditSub').textContent = isVideoPreview ? '' : tr('smart.previewHint');
        applyBtn.style.display = 'none';
        refreshComparePanel();
    } else {
        ensureImageEditBaseSize(true);
        applyImageEditZoom();
        applyBtn.style.display = '';
        const icon = imageEditMode === 'crop' ? 'crop' : imageEditMode === 'outpaint' ? 'expand' : imageEditMode === 'mask' ? 'brush' : imageEditMode === 'brush' ? 'paintbrush' : 'grid-3x3';
        const labelKey = imageEditMode === 'crop' ? 'canvas.applyCrop' : imageEditMode === 'outpaint' ? 'canvas.applyOutpaint' : imageEditMode === 'mask' ? 'canvas.applyMask' : imageEditMode === 'brush' ? 'canvas.applyBrush' : 'canvas.applyGrid';
        const titleKey = imageEditMode === 'crop' ? 'canvas.cropImage' : imageEditMode === 'outpaint' ? 'canvas.outpaintImage' : imageEditMode === 'mask' ? 'canvas.maskEdit' : imageEditMode === 'brush' ? 'canvas.brushEdit' : 'canvas.modeGrid';
        const subKey = imageEditMode === 'crop' ? 'canvas.cropHint' : imageEditMode === 'outpaint' ? 'canvas.outpaintHint' : imageEditMode === 'mask' ? 'canvas.maskHint2' : imageEditMode === 'brush' ? 'canvas.brushHint' : 'canvas.gridHint';
        document.getElementById('imageEditTitle').textContent = tr(titleKey);
        document.getElementById('imageEditSub').textContent = tr(subKey);
        const applyLabel = imageEditMode === 'grid' && gridOperationMode === 'join' ? '输出拼接' : tr(labelKey);
        applyBtn.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4"></i><span>${applyLabel}</span>`;
        if(imageEditMode === 'crop'){
            requestAnimationFrame(() => {
                resetCropBox();
                syncImageEditOverflow();
            });
        } else if(imageEditMode === 'outpaint'){
            requestAnimationFrame(() => {
                resetOutpaintBox();
                syncImageEditOverflow();
            });
        }
    }
    resizeEditDrawCanvas();
    if(imageEditMode === 'grid') refreshGridSplitPreview();
    else if(imageEditMode === 'crop' || imageEditMode === 'outpaint' || prev === 'grid') clearEditDrawing(true);
    syncEditDrawingHistoryButtons();
    syncBrushToolButtons();
    syncTextToolState(true);
    updatePreviewNavButtons();
    refreshIcons();
}
let previewCompareOn = false;
let previewCompareIndex = -1;
let previewMetaExtraText = '';
function applyPreviewTransform(){
    const frame = document.getElementById('previewFrame');
    if(frame){
        frame.style.transform = panoramaState.enabled ? '' : `translate(${previewPan.x}px, ${previewPan.y}px) scale(${previewZoom})`;
    }
    updateZoomLabel();
}
function resetPreviewTransform(){
    previewZoom = 1.0;
    previewPan = {x:0, y:0};
    previewComparePos = 50;
    document.getElementById('previewStage')?.style.setProperty('--compare-pos', `${previewComparePos}%`);
    applyPreviewTransform();
}
function panoramaRatioValue(){
    const preset = PANORAMA_RATIO_PRESETS[panoramaState.ratio];
    if(preset) return preset;
    return {
        w:Math.max(1, Number(panoramaState.customW) || 16),
        h:Math.max(1, Number(panoramaState.customH) || 9)
    };
}
function panoramaResolutionValue(){
    const longSide = 1536;
    const ratio = panoramaRatioValue();
    const aspect = ratio.w / Math.max(1, ratio.h);
    if(aspect >= 1){
        return {w:longSide, h:Math.max(1, Math.round(longSide / aspect))};
    }
    return {w:Math.max(1, Math.round(longSide * aspect)), h:longSide};
}
function panoramaSource(){
    const editing = currentEditImage();
    const image = editing.image || {};
    if(mediaKindForItem(image) !== 'image') return '';
    return displayMediaUrl(image.url ? image : (image.url || ''));
}
function panoramaFallbackSource(){
    const image = currentEditImage().image || {};
    return image?.url ? proxiedMediaUrl(image) : '';
}
function isLikelyPanoramaImage(node, image, naturalW=0, naturalH=0){
    if(mediaKindForItem(image || {}) !== 'image') return false;
    const text = [
        image?.name,
        image?.title,
        node?.title,
        node?.runPrompt,
        node?.runModelPrompt,
        node?.promptDraftText,
        node?.runSettings?.ratio,
        node?.runSettings?.msRatio,
        node?.runSettings?.size,
        node?.runSettings?.customSize
    ].filter(Boolean).join(' ');
    if(/(?:360|全景|环景|panorama|equirect|spherical|vr\b)/i.test(text)) return true;
    const w = Number(naturalW || image?.natural_w || image?.width || image?.w || 0);
    const h = Number(naturalH || image?.natural_h || image?.height || image?.h || 0);
    if(!(w > 0 && h > 0)) return false;
    const aspect = w / h;
    return aspect >= 1.9 && aspect <= 2.1;
}
async function ensurePanoramaRenderer(){
    const canvas = document.getElementById('panoramaCanvas');
    if(!canvas) return false;
    if(!panoramaState.three){
        panoramaState.threeLoadPromise = panoramaState.threeLoadPromise || import('/static/vendor/js/three-0.160.0.module.js?v=2026.05.30');
        panoramaState.three = await panoramaState.threeLoadPromise;
    }
    const THREE = panoramaState.three;
    if(!panoramaState.renderer){
        panoramaState.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias:true,
            alpha:false,
            preserveDrawingBuffer:true
        });
        panoramaState.renderer.setPixelRatio(1);
        panoramaState.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    if(!panoramaState.scene){
        panoramaState.scene = new THREE.Scene();
        panoramaState.camera = new THREE.PerspectiveCamera(panoramaState.fov, 16 / 9, 1, 1200);
        const geometry = new THREE.SphereGeometry(500, 96, 64);
        geometry.scale(-1, 1, 1);
        const material = new THREE.MeshBasicMaterial({color:0xffffff});
        panoramaState.sphere = new THREE.Mesh(geometry, material);
        panoramaState.scene.add(panoramaState.sphere);
    }
    return Boolean(panoramaState.renderer && panoramaState.scene && panoramaState.camera && panoramaState.sphere);
}
function applyPanoramaTexture(img){
    const THREE = panoramaState.three;
    if(!THREE || !panoramaState.sphere || !img?.naturalWidth || !img?.naturalHeight) return false;
    if(panoramaState.texture){
        panoramaState.texture.dispose?.();
        panoramaState.texture = null;
    }
    const texture = new THREE.Texture(img);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    panoramaState.texture = texture;
    panoramaState.sphere.material.map = texture;
    panoramaState.sphere.material.needsUpdate = true;
    return true;
}
function drawPanoramaFrame(){
    const canvas = document.getElementById('panoramaCanvas');
    const img = panoramaState.image;
    const {renderer, scene, camera, sphere, three:THREE} = panoramaState;
    if(!panoramaState.enabled || !canvas || !renderer || !scene || !camera || !sphere || !THREE || !img?.naturalWidth || !img?.naturalHeight) return false;
    const width = Math.max(1, canvas.width);
    const height = Math.max(1, canvas.height);
    renderer.setSize(width, height, false);
    camera.fov = Math.max(35, Math.min(100, panoramaState.fov));
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    const pitch = Math.max(-85, Math.min(85, panoramaState.pitch));
    const phi = THREE.MathUtils.degToRad(90 - pitch);
    const theta = THREE.MathUtils.degToRad(panoramaState.yaw);
    const target = new THREE.Vector3(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
    );
    camera.position.set(0, 0, 0);
    camera.lookAt(target);
    renderer.render(scene, camera);
    return true;
}
function renderPanoramaFrame(){
    if(!drawPanoramaFrame()) return;
    panoramaState.animationId = requestAnimationFrame(renderPanoramaFrame);
}
function startPanoramaLoop(){
    if(panoramaState.animationId) cancelAnimationFrame(panoramaState.animationId);
    panoramaState.animationId = requestAnimationFrame(renderPanoramaFrame);
}
function stopPanoramaLoop(){
    if(panoramaState.animationId) cancelAnimationFrame(panoramaState.animationId);
    panoramaState.animationId = 0;
}
function resizePanoramaViewer(){
    const stage = document.getElementById('panoramaStage');
    const frame = document.getElementById('previewFrame');
    const canvas = document.getElementById('panoramaCanvas');
    if(!stage) return;
    const ratio = panoramaRatioValue();
    const aspect = Math.max(0.08, Math.min(12, ratio.w / ratio.h));
    const maxW = Math.max(260, Math.min(1180, window.innerWidth - 116));
    const maxH = Math.max(220, Math.min(780, window.innerHeight - 220));
    let w = maxW;
    let h = w / aspect;
    if(h > maxH){
        h = maxH;
        w = h * aspect;
    }
    w = Math.max(160, Math.round(w));
    h = Math.max(160, Math.round(h));
    stage.style.width = `${w}px`;
    stage.style.height = `${h}px`;
    stage.style.aspectRatio = `${ratio.w} / ${ratio.h}`;
    if(frame){
        frame.style.width = `${w}px`;
        frame.style.height = `${h}px`;
    }
    if(canvas){
        const render = panoramaResolutionValue();
        const nextW = Math.max(1, Math.round(render.w));
        const nextH = Math.max(1, Math.round(render.h));
        if(canvas.width !== nextW) canvas.width = nextW;
        if(canvas.height !== nextH) canvas.height = nextH;
    }
}
function disposePanoramaTexture(){
    if(panoramaState.texture){
        panoramaState.texture.dispose?.();
        panoramaState.texture = null;
    }
    if(panoramaState.sphere?.material){
        panoramaState.sphere.material.map = null;
        panoramaState.sphere.material.needsUpdate = true;
    }
    panoramaState.image = null;
}
async function loadPanoramaTexture(src, allowFallback=true){
    if(!src) return;
    const token = ++panoramaState.loadToken;
    const stage = document.getElementById('panoramaStage');
    stage?.classList.remove('ready');
    let ready = false;
    try {
        ready = await ensurePanoramaRenderer();
    } catch(e) {
        console.warn('panorama renderer init failed', e);
        ready = false;
    }
    if(!ready){
        stage?.classList.add('ready');
        toast(tr('smart.panoramaLoadFailed'));
        return;
    }
    if(token !== panoramaState.loadToken) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const fallback = allowFallback ? panoramaFallbackSource() : '';
    const done = () => {
        if(token !== panoramaState.loadToken){
            return;
        }
        disposePanoramaTexture();
        if(!applyPanoramaTexture(img)){
            stage?.classList.add('ready');
            toast(tr('smart.panoramaLoadFailed'));
            return;
        }
        panoramaState.image = img;
        panoramaState.loadedSrc = src;
        stage?.classList.add('ready');
        resizePanoramaViewer();
        startPanoramaLoop();
    };
    const fail = () => {
        if(token !== panoramaState.loadToken) return;
        if(fallback && fallback !== src){
            loadPanoramaTexture(fallback, false);
            return;
        }
        stage?.classList.add('ready');
        toast(tr('smart.panoramaLoadFailed'));
    };
    img.onload = done;
    img.onerror = fail;
    img.src = src;
    if(img.complete && img.naturalWidth) done();
}
function refreshPanoramaControls(){
    const controls = document.getElementById('panoramaControls');
    const custom = document.getElementById('panoramaCustomRatio');
    if(controls) controls.style.display = panoramaState.enabled ? 'inline-flex' : 'none';
    if(custom) custom.style.display = panoramaState.enabled && panoramaState.ratio === 'custom' ? 'inline-flex' : 'none';
    document.querySelectorAll('[data-panorama-ratio]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.panoramaRatio === panoramaState.ratio);
    });
    const w = document.getElementById('panoramaRatioW');
    const h = document.getElementById('panoramaRatioH');
    if(w && document.activeElement !== w) w.value = panoramaState.customW;
    if(h && document.activeElement !== h) h.value = panoramaState.customH;
}
function setPanoramaEnabled(enabled){
    const next = Boolean(enabled);
    if(panoramaState.enabled === next) return;
    panoramaState.enabled = next;
    const stage = document.getElementById('previewStage');
    const pano = document.getElementById('panoramaStage');
    const currentImg = document.getElementById('previewCurrentImage');
    const compareLayer = document.getElementById('previewCompareLayer');
    const compareHandle = document.getElementById('previewCompareHandle');
    const toggle = document.getElementById('panoramaToggleBtn');
    const exportBtn = document.getElementById('panoramaExportBtn');
    const compareToggle = document.getElementById('compareToggleBtn');
    const compareThumbs = document.getElementById('compareThumbs');
    const previewTools = document.getElementById('imagePreviewTools');
    stage?.classList.toggle('panorama-on', next);
    previewTools?.classList.toggle('panorama-tools-on', next);
    if(pano) pano.style.display = next ? 'block' : 'none';
    if(currentImg) currentImg.style.display = next ? 'none' : 'block';
    if(compareLayer && next) compareLayer.style.display = 'none';
    if(compareHandle && next) compareHandle.style.display = 'none';
    if(toggle) toggle.classList.toggle('active', next);
    if(exportBtn) exportBtn.style.display = next ? 'inline-flex' : 'none';
    if(compareToggle) compareToggle.style.display = next ? 'none' : 'inline-flex';
    if(compareThumbs && next){ compareThumbs.style.display = 'none'; compareThumbs.innerHTML = ''; }
    previewCompareOn = next ? false : previewCompareOn;
    if(next){
        previewPan = {x:0, y:0};
        previewZoom = 1.0;
        applyPreviewTransform();
        resizePanoramaViewer();
        loadPanoramaTexture(panoramaSource());
        updatePreviewMetaHint(tr('smart.panoramaHint'));
    } else {
        stopPanoramaLoop();
        const frame = document.getElementById('previewFrame');
        if(frame){ frame.style.width = ''; frame.style.height = ''; }
        refreshComparePanel();
    }
    refreshPanoramaControls();
    updateZoomLabel();
}
function togglePanoramaPreview(){
    const image = currentEditImage().image || {};
    if(mediaKindForItem(image) !== 'image') return;
    setPanoramaEnabled(!panoramaState.enabled);
}
async function exportPanoramaFrame(){
    if(!panoramaState.enabled) return;
    const canvasEl = document.getElementById('panoramaCanvas');
    if(!canvasEl){ toast(tr('smart.panoramaExportFailed')); return; }
    try {
        if(!drawPanoramaFrame()) throw new Error(tr('smart.panoramaExportFailed'));
        const blob = await new Promise(resolve => canvasEl.toBlob(resolve, 'image/png'));
        if(!blob) throw new Error(tr('smart.panoramaExportFailed'));
        const editing = currentEditImage();
        const rawName = editing.image?.name || fileNameFromUrl(editing.image?.url || '') || 'panorama';
        const base = String(rawName).replace(/\.[a-z0-9]{2,8}$/i, '') || 'panorama';
        const filename = safeExportFileName(`${base}-panorama.png`, 'panorama.png');
        const uploaded = await uploadFiles([new File([blob], filename, {type:'image/png'})]);
        const frame = uploaded[0];
        if(!frame?.url) throw new Error(tr('smart.panoramaExportFailed'));
        frame.kind = 'image';
        frame.natural_w = canvasEl.width;
        frame.natural_h = canvasEl.height;
        const rect = editing.node ? nodeRect(editing.node) : null;
        const point = rect
            ? {x:rect.x + rect.width + 240, y:rect.y + rect.height / 2}
            : viewportCenter();
        pushUndo();
        const newNode = createImageNodeAt(point, [frame], {select:true, skipUndo:true});
        selectedIds = [];
        selectedImage = {nodeId:newNode.id, index:0};
        render();
        scheduleSave();
        toast(tr('smart.panoramaExportDone'));
    } catch(e) {
        toast((e.message || tr('smart.panoramaExportFailed')).slice(0, 120));
    }
}
function resetPanoramaView(){
    panoramaState.fov = 75;
    panoramaState.yaw = 0;
    panoramaState.pitch = 0;
    resizePanoramaViewer();
    updateZoomLabel();
}
function disposePanoramaPreview(){
    stopPanoramaLoop();
    disposePanoramaTexture();
    panoramaState.enabled = false;
    panoramaState.drag = null;
    panoramaState.loadedSrc = '';
    panoramaState.loadToken++;
    const stage = document.getElementById('panoramaStage');
    stage?.classList.remove('ready');
    if(stage) stage.style.display = 'none';
    document.getElementById('previewStage')?.classList.remove('panorama-on', 'panning');
    document.getElementById('imagePreviewTools')?.classList.remove('panorama-tools-on');
    document.getElementById('panoramaControls')?.style.setProperty('display', 'none');
    document.getElementById('panoramaToggleBtn')?.classList.remove('active');
    document.getElementById('panoramaExportBtn')?.style.setProperty('display', 'none');
}
function applyPanoramaRatio(value){
    panoramaState.ratio = PANORAMA_RATIO_PRESETS[value] ? value : 'custom';
    refreshPanoramaControls();
    resizePanoramaViewer();
}
function setPreviewComparePos(clientX){
    const frame = document.getElementById('previewFrame');
    const stage = document.getElementById('previewStage');
    if(!frame || !stage) return;
    const rect = frame.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / Math.max(1, rect.width)) * 100));
    previewComparePos = pct;
    stage.style.setProperty('--compare-pos', `${pct}%`);
}
function syncPreviewFrameSize(){
    const frame = document.getElementById('previewFrame');
    if(panoramaState.enabled){
        resizePanoramaViewer();
        return;
    }
    const currentImg = document.getElementById('previewCurrentImage');
    const currentVideo = document.getElementById('previewCurrentVideo');
    const compareImg = document.getElementById('previewCompareImage');
    const currentMedia = currentVideo && currentVideo.style.display !== 'none' ? currentVideo : currentImg;
    if(!frame || !currentMedia) return;
    const w = currentMedia.clientWidth || currentMedia.videoWidth || currentMedia.naturalWidth || 1;
    const h = currentMedia.clientHeight || currentMedia.videoHeight || currentMedia.naturalHeight || 1;
    frame.style.width = `${w}px`;
    frame.style.height = `${h}px`;
    if(compareImg){
        compareImg.style.width = `${w}px`;
        compareImg.style.height = `${h}px`;
    }
}
function previewResolutionText(){
    const editing = currentEditImage();
    const image = editing.image || {};
    const currentImg = document.getElementById('previewCurrentImage');
    const currentVideo = document.getElementById('previewCurrentVideo');
    const cropImg = document.getElementById('cropImage');
    const w = Number(image.natural_w || image.width || image.w || 0) || Number(currentVideo?.videoWidth || 0) || Number(currentImg?.naturalWidth || 0) || Number(cropImg?.naturalWidth || 0);
    const h = Number(image.natural_h || image.height || image.h || 0) || Number(currentVideo?.videoHeight || 0) || Number(currentImg?.naturalHeight || 0) || Number(cropImg?.naturalHeight || 0);
    if(!w || !h) return '';
    return `${tr('smart.resolution')}: ${Math.round(w)} x ${Math.round(h)}`;
}
function updatePreviewMetaHint(extraText=previewMetaExtraText){
    previewMetaExtraText = extraText || '';
    const hint = document.getElementById('previewMetaHint');
    if(!hint) return;
    hint.textContent = [previewResolutionText(), previewMetaExtraText].filter(Boolean).join(' · ');
}
function rememberPreviewImageResolution(){
    const editing = currentEditImage();
    const image = editing.image;
    if(!image) return;
    const currentImg = document.getElementById('previewCurrentImage');
    const currentVideo = document.getElementById('previewCurrentVideo');
    const cropImg = document.getElementById('cropImage');
    const w = Number(currentVideo?.videoWidth || 0) || Number(currentImg?.naturalWidth || 0) || Number(cropImg?.naturalWidth || 0);
    const h = Number(currentVideo?.videoHeight || 0) || Number(currentImg?.naturalHeight || 0) || Number(cropImg?.naturalHeight || 0);
    if(w > 0 && h > 0 && (!image.natural_w || !image.natural_h)){
        image.natural_w = w;
        image.natural_h = h;
        scheduleSave();
    }
}
function previewCompareSources(){
    const editing = currentEditImage();
    const node = editing.node;
    if(!node) return [];
    const savedRefs = Array.isArray(node.runInputRefs) ? node.runInputRefs.filter(ref => ref?.url) : [];
    const upstream = savedRefs.length ? savedRefs : inputImagesFor(node);
    const dedup = [];
    const seen = new Set();
    for(const img of upstream){
        if(!img?.url || seen.has(img.url) || mediaKindForItem(img) !== 'image') continue;
        seen.add(img.url);
        dedup.push(img);
    }
    if(dedup.length) return dedup;
    const sourceId = node.sourceNodeId;
    if(sourceId){
        const src = nodes.find(n => n.id === sourceId);
        if(src && (src.images || []).length){
            for(const img of src.images){
                if(!img?.url || seen.has(img.url) || mediaKindForItem(img) !== 'image') continue;
                seen.add(img.url);
                dedup.push(img);
            }
        }
    }
    return dedup;
}
function refreshComparePanel(){
    const stage = document.getElementById('previewStage');
    const compareImg = document.getElementById('previewCompareImage');
    const currentImg = document.getElementById('previewCurrentImage');
    const currentVideo = document.getElementById('previewCurrentVideo');
    const compareLayer = document.getElementById('previewCompareLayer');
    const compareHandle = document.getElementById('previewCompareHandle');
    const thumbsEl = document.getElementById('compareThumbs');
    const toggle = document.getElementById('compareToggleBtn');
    const panoramaToggle = document.getElementById('panoramaToggleBtn');
    const editing = currentEditImage();
    const curUrl = editing.image?.url || '';
    const isVideoPreview = mediaKindForItem(editing.image || {}) === 'video';
    const isPreviewMode = imageEditMode === 'preview';
    if(panoramaToggle){
        panoramaToggle.style.display = isPreviewMode && !isVideoPreview ? 'inline-flex' : 'none';
        panoramaToggle.classList.toggle('active', panoramaState.enabled);
    }
    if(!isPreviewMode && panoramaState.enabled) disposePanoramaPreview();
    if(panoramaState.enabled && isPreviewMode && !isVideoPreview){
        currentImg.onload = null;
        currentImg.onerror = null;
        currentImg.style.display = 'none';
        stage?.classList.remove('compare-on');
        if(compareLayer) compareLayer.style.display = 'none';
        if(compareHandle) compareHandle.style.display = 'none';
        if(thumbsEl){ thumbsEl.style.display = 'none'; thumbsEl.innerHTML = ''; }
        if(toggle) toggle.classList.remove('active');
        updatePreviewMetaHint(tr('smart.panoramaHint'));
        return;
    }
    const onCurrentLoaded = () => {
        rememberPreviewImageResolution();
        syncPreviewFrameSize();
        updatePreviewMetaHint();
    };
    if(isVideoPreview){
        currentImg.onload = null;
        currentImg.onerror = null;
        currentImg.removeAttribute('src');
        currentImg.style.display = 'none';
        if(currentVideo){
            const previewSrc = displayMediaUrl(editing.image || curUrl);
            currentVideo.style.display = 'block';
            currentVideo.onloadedmetadata = onCurrentLoaded;
            currentVideo.onloadeddata = onCurrentLoaded;
            if(currentVideo.getAttribute('src') !== previewSrc){
                currentVideo.src = previewSrc;
                currentVideo.load?.();
            }
            if(currentVideo.readyState >= 1) requestAnimationFrame(onCurrentLoaded);
        }
        previewCompareOn = false;
        previewCompareIndex = -1;
        stage.classList.remove('compare-on');
        if(compareLayer) compareLayer.style.display = 'none';
        if(compareHandle) compareHandle.style.display = 'none';
        if(thumbsEl){ thumbsEl.style.display = 'none'; thumbsEl.innerHTML = ''; }
        if(toggle){
            toggle.disabled = true;
            toggle.style.opacity = '.45';
            toggle.classList.remove('active');
            toggle.title = tr('smart.compareEmpty');
        }
        if(panoramaToggle) panoramaToggle.style.display = 'none';
        updatePreviewMetaHint(editing.node?.runPrompt ? `${tr('smart.runPromptPrefix')}${editing.node.runPrompt.slice(0, 60)}` : '');
        return;
    }
    if(currentVideo){
        currentVideo.pause?.();
        currentVideo.onloadedmetadata = null;
        currentVideo.onloadeddata = null;
        currentVideo.removeAttribute('src');
        currentVideo.load?.();
        currentVideo.style.display = 'none';
    }
    currentImg.style.display = 'block';
    currentImg.onload = onCurrentLoaded;
    currentImg.onerror = () => {
        if(currentImg.dataset.proxyFallbackTried === '1') return;
        const fallback = proxiedMediaUrl(editing.image || curUrl);
        if(!fallback || fallback === currentImg.getAttribute('src')) return;
        currentImg.dataset.proxyFallbackTried = '1';
        currentImg.src = fallback;
    };
    const previewSrc = displayMediaUrl(editing.image || curUrl);
    if(currentImg.getAttribute('src') !== previewSrc) {
        currentImg.dataset.proxyFallbackTried = '';
        currentImg.src = previewSrc;
    }
    if(currentImg.complete && currentImg.naturalWidth) requestAnimationFrame(onCurrentLoaded);
    const sources = previewCompareSources();
    const hasSource = sources.length > 0;
    if(toggle){
        toggle.disabled = !hasSource;
        toggle.style.opacity = hasSource ? '1' : '.45';
        toggle.title = hasSource ? tr('smart.compareHover') : tr('smart.compareEmpty');
        toggle.classList.toggle('active', hasSource && previewCompareOn);
    }
    if(!hasSource){
        previewCompareOn = false;
        previewCompareIndex = -1;
        stage.classList.remove('compare-on');
        if(compareLayer) compareLayer.style.display = 'none';
        if(compareHandle) compareHandle.style.display = 'none';
        thumbsEl.style.display = 'none';
        updatePreviewMetaHint(editing.node?.runPrompt ? `${tr('smart.runPromptPrefix')}${editing.node.runPrompt.slice(0, 60)}` : '');
        return;
    }
    const sliderActive = previewCompareOn && previewCompareIndex >= 0 && previewCompareIndex < sources.length;
    if(sliderActive){
        const src = sources[previewCompareIndex];
        compareImg.src = src?.url || '';
        compareImg.onload = syncPreviewFrameSize;
        syncPreviewFrameSize();
        stage.classList.add('compare-on');
        if(compareLayer) compareLayer.style.display = '';
        if(compareHandle) compareHandle.style.display = '';
    } else {
        stage.classList.remove('compare-on');
        if(compareLayer) compareLayer.style.display = 'none';
        if(compareHandle) compareHandle.style.display = 'none';
    }
    if(previewCompareOn){
        thumbsEl.style.display = 'inline-flex';
        thumbsEl.innerHTML = sources.map((s, i) => `<button type="button" class="compare-thumb ${i === previewCompareIndex ? 'active' : ''}" data-compare-idx="${i}" title="${escapeHtml(i === previewCompareIndex ? tr('smart.compareCancelTip') : tr('smart.compareUseTip'))}">${smartPreviewImgHtml(s.url, 256)}</button>`).join('');
        bindSmartPreviewImageFallbacks(thumbsEl);
        thumbsEl.querySelectorAll('[data-compare-idx]').forEach(btn => {
            btn.onclick = e => {
                e.preventDefault(); e.stopPropagation();
                const idx = Number(btn.dataset.compareIdx);
                previewCompareIndex = (previewCompareIndex === idx) ? -1 : idx;
                refreshComparePanel();
            };
        });
    } else {
        thumbsEl.style.display = 'none';
        thumbsEl.innerHTML = '';
    }
    let txt = editing.node?.runPrompt ? `${tr('smart.runPromptPrefix')}${editing.node.runPrompt.slice(0, 60)}` : '';
    if(previewCompareOn && !sliderActive) txt = (txt ? `${txt} · ` : '') + tr('smart.compareHintPick');
    updatePreviewMetaHint(txt);
}
function togglePreviewCompare(){
    const sources = previewCompareSources();
    if(!sources.length){ toast(tr('smart.compareNoSource')); return; }
    previewCompareOn = !previewCompareOn;
    if(previewCompareOn && (previewCompareIndex < 0 || previewCompareIndex >= sources.length)) previewCompareIndex = 0;
    if(!previewCompareOn) previewCompareIndex = -1;
    refreshComparePanel();
}
function currentPreviewVideo(){
    if(!imageEditModal.classList.contains('open')) return null;
    if(mediaKindForItem(currentEditImage().image || {}) !== 'video') return null;
    return document.getElementById('previewCurrentVideo');
}
function videoFrameStep(){
    const image = currentEditImage().image || {};
    const fps = Number(image.fps || image.frameRate || image.frame_rate || image.framespersecond || image.frames_per_second || 0);
    return 1 / Math.max(1, Math.min(120, Number.isFinite(fps) && fps > 0 ? fps : 30));
}
function seekPreviewVideoFrames(direction){
    const video = currentPreviewVideo();
    if(!video || video.readyState < 1) return false;
    video.pause?.();
    const step = videoFrameStep();
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    const maxTime = duration ? Math.max(0, duration - step / 2) : Number.MAX_SAFE_INTEGER;
    video.currentTime = Math.max(0, Math.min(maxTime, Number(video.currentTime || 0) + direction * step));
    return true;
}
function waitForVideoEvent(video, eventName, timeout=1500){
    return new Promise(resolve => {
        let done = false;
        const finish = () => {
            if(done) return;
            done = true;
            clearTimeout(timer);
            video.removeEventListener(eventName, finish);
            resolve();
        };
        const timer = setTimeout(finish, timeout);
        video.addEventListener(eventName, finish, {once:true});
    });
}
async function seekVideoForFrame(video, time){
    if(Math.abs(Number(video.currentTime || 0) - time) <= 0.002) return;
    video.currentTime = time;
    await waitForVideoEvent(video, 'seeked', 2200);
}
async function exportVideoFrame(which='current'){
    const video = currentPreviewVideo();
    if(!video){ toast('没有可导出的视频帧'); return; }
    if(video.readyState < 2) await waitForVideoEvent(video, 'loadeddata', 2200);
    if(!video.videoWidth || !video.videoHeight){ toast('视频还没有加载完成'); return; }
    const originalTime = Number(video.currentTime || 0);
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    const step = videoFrameStep();
    const target = which === 'first'
        ? 0
        : which === 'last'
            ? Math.max(0, duration - step / 2)
            : originalTime;
    const suffix = which === 'first' ? 'first-frame' : which === 'last' ? 'last-frame' : 'current-frame';
    try {
        video.pause?.();
        await seekVideoForFrame(video, target);
        const canvasEl = document.createElement('canvas');
        canvasEl.width = video.videoWidth;
        canvasEl.height = video.videoHeight;
        const ctx = canvasEl.getContext('2d');
        ctx.drawImage(video, 0, 0, canvasEl.width, canvasEl.height);
        const blob = await new Promise(resolve => canvasEl.toBlob(resolve, 'image/png'));
        if(!blob) throw new Error('导出帧失败');
        const editing = currentEditImage();
        const rawName = editing.image?.name || fileNameFromUrl(editing.image?.url || '') || 'video';
        const base = String(rawName).replace(/\.[a-z0-9]{2,8}$/i, '') || 'video';
        const filename = safeExportFileName(`${base}-${suffix}.png`, `${suffix}.png`);
        const uploaded = await uploadFiles([new File([blob], filename, {type:'image/png'})]);
        const frame = uploaded[0];
        if(!frame?.url) throw new Error('导出到画布失败');
        frame.kind = 'image';
        frame.natural_w = video.videoWidth;
        frame.natural_h = video.videoHeight;
        const rect = editing.node ? nodeRect(editing.node) : null;
        const point = rect
            ? {x:rect.x + rect.width + 240, y:rect.y + rect.height / 2}
            : viewportCenter();
        pushUndo();
        const newNode = createImageNodeAt(point, [frame], {select:true, skipUndo:true});
        selectedIds = [];
        selectedImage = {nodeId:newNode.id, index:0};
        render();
        scheduleSave();
        toast('已导出到画布');
        if(which !== 'current') await seekVideoForFrame(video, originalTime);
    } catch(e) {
        toast((e.message || '导出帧失败').slice(0, 120));
    }
}
function editDrawSnapshot(){
    const canvasEl = editDrawCanvas();
    return {
        imageData:canvasEl.getContext('2d').getImageData(0, 0, canvasEl.width, canvasEl.height),
        labelCounter:brushLabelCounter,
        textItems:editTextItems.map(item => ({...item})),
        textSelectedId:editTextSelectedId || ''
    };
}
function restoreEditDrawSnapshot(snapshot){
    if(!snapshot) return;
    removeEditTextInlineEditor(false);
    editDrawCanvas().getContext('2d').putImageData(snapshot.imageData || snapshot, 0, 0);
    if(snapshot.labelCounter) brushLabelCounter = snapshot.labelCounter;
    editTextItems = (snapshot.textItems || []).map(item => ({...item}));
    editTextSelectedId = snapshot.textSelectedId || '';
    renderEditTextCanvas();
    syncTextToolState(true);
}
function pushEditDrawHistory(){
    editDrawUndoStack.push(editDrawSnapshot());
    if(editDrawUndoStack.length > EDIT_DRAW_HISTORY_MAX) editDrawUndoStack.shift();
    editDrawRedoStack = [];
    syncEditDrawingHistoryButtons();
}
function syncEditDrawingHistoryButtons(){
    ['maskUndoBtn','brushUndoBtn'].forEach(id => { const btn = document.getElementById(id); if(btn){ btn.disabled = !editDrawUndoStack.length; btn.style.opacity = editDrawUndoStack.length ? '1' : '.42'; } });
    ['maskRedoBtn','brushRedoBtn'].forEach(id => { const btn = document.getElementById(id); if(btn){ btn.disabled = !editDrawRedoStack.length; btn.style.opacity = editDrawRedoStack.length ? '1' : '.42'; } });
}
function undoEditDrawing(){
    if(!editDrawUndoStack.length) return;
    editDrawRedoStack.push(editDrawSnapshot());
    restoreEditDrawSnapshot(editDrawUndoStack.pop());
    syncEditDrawingHistoryButtons();
}
function redoEditDrawing(){
    if(!editDrawRedoStack.length) return;
    editDrawUndoStack.push(editDrawSnapshot());
    restoreEditDrawSnapshot(editDrawRedoStack.pop());
    syncEditDrawingHistoryButtons();
}
function editCanvasHasPixels(){
    if(editTextHasContent()) return true;
    const canvasEl = editDrawCanvas();
    const data = canvasEl.getContext('2d').getImageData(0, 0, canvasEl.width, canvasEl.height).data;
    for(let i = 3; i < data.length; i += 4) if(data[i] > 0) return true;
    return false;
}
function clearEditDrawing(silent=false){
    removeEditTextInlineEditor(false);
    const canvasEl = editDrawCanvas();
    if(!silent && editCanvasHasPixels()) pushEditDrawHistory();
    canvasEl.getContext('2d').clearRect(0, 0, canvasEl.width, canvasEl.height);
    const textCanvasEl = editTextCanvas();
    textCanvasEl?.getContext('2d')?.clearRect(0, 0, textCanvasEl.width, textCanvasEl.height);
    editTextItems = [];
    editTextSelectedId = '';
    editTextDrag = null;
    editTextDirty = false;
    brushLabelCounter = 1;
    syncTextToolState(true);
    syncEditDrawingHistoryButtons();
}
function resetEditDrawingHistory(){
    removeEditTextInlineEditor(false);
    editDrawUndoStack = [];
    editDrawRedoStack = [];
    brushLabelCounter = 1;
    editTextItems = [];
    editTextSelectedId = '';
    editTextDrag = null;
    editTextDirty = false;
    renderEditTextCanvas();
    syncTextToolState(true);
    syncEditDrawingHistoryButtons();
}
function setBrushTool(tool){
    if(tool !== 'text') removeEditTextInlineEditor(true);
    brushTool = ['free','rect','ellipse','label','text'].includes(tool) ? tool : 'free';
    syncBrushToolButtons();
    syncTextToolState(true);
}
function syncBrushToolButtons(){
    document.querySelectorAll('[data-brush-tool]').forEach(btn => {
        const active = btn.dataset.brushTool === brushTool;
        btn.classList.toggle('primary', active);
        btn.classList.toggle('secondary', !active);
    });
    document.getElementById('cropCanvas')?.classList.toggle('text-mode', imageEditMode === 'brush' && brushTool === 'text');
}
function editDrawPoint(event){
    const canvasEl = editDrawCanvas();
    const rect = canvasEl.getBoundingClientRect();
    return {x:(event.clientX - rect.left) * canvasEl.width / Math.max(1, rect.width), y:(event.clientY - rect.top) * canvasEl.height / Math.max(1, rect.height)};
}
function gridCustomLineHit(point){
    const canvasEl = editDrawCanvas();
    const threshold = Math.max(8, Math.min(canvasEl.width, canvasEl.height) / 80);
    let best = -1, bestDist = Infinity;
    gridCustomLines.forEach((line, index) => {
        const dist = line.type === 'h' ? Math.abs(point.y - line.pos * canvasEl.height) : Math.abs(point.x - line.pos * canvasEl.width);
        if(dist < bestDist && dist <= threshold){ best = index; bestDist = dist; }
    });
    return best;
}
function setGridCustomLinePos(index, point){
    const canvasEl = editDrawCanvas();
    const line = gridCustomLines[index];
    if(!line) return;
    line.pos = line.type === 'h'
        ? Math.max(0.001, Math.min(0.999, point.y / Math.max(1, canvasEl.height)))
        : Math.max(0.001, Math.min(0.999, point.x / Math.max(1, canvasEl.width)));
}
const MASK_BRUSH_ALPHA = 115;
const MASK_BRUSH_COLOR = `rgba(255,255,255,${MASK_BRUSH_ALPHA / 255})`;
function editBrushSize(){ return Number(document.getElementById(imageEditMode === 'mask' ? 'maskBrushSize' : 'paintBrushSize')?.value || 20); }
function brushColor(){ return document.getElementById('paintBrushColor')?.value || '#ff2d55'; }
function setupDrawStyle(ctx){
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = editBrushSize();
    ctx.strokeStyle = imageEditMode === 'mask' ? MASK_BRUSH_COLOR : brushColor();
    ctx.fillStyle = imageEditMode === 'mask' ? MASK_BRUSH_COLOR : brushColor();
    ctx.globalCompositeOperation = 'source-over';
}
function normalizeMaskPreviewCanvas(canvasEl=editDrawCanvas()){
    if(imageEditMode !== 'mask' || !canvasEl?.width || !canvasEl?.height) return;
    const ctx = canvasEl.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
    const data = imageData.data;
    let changed = false;
    for(let i = 0; i < data.length; i += 4){
        if(data[i + 3] <= 0) continue;
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        if(data[i + 3] > MASK_BRUSH_ALPHA) data[i + 3] = MASK_BRUSH_ALPHA;
        changed = true;
    }
    if(changed) ctx.putImageData(imageData, 0, 0);
}
function strokeFreeDrawPoint(point){
    if(!editDrawState) return;
    const ctx = editDrawCanvas().getContext('2d');
    setupDrawStyle(ctx);
    const dx = point.x - editDrawState.x;
    const dy = point.y - editDrawState.y;
    const dist = Math.hypot(dx, dy);
    const radius = Math.max(1, editBrushSize() / 2);
    if(dist > radius){
        const steps = Math.ceil(dist / Math.max(1, radius * 0.35));
        for(let i = 1; i <= steps; i++){
            const t = i / steps;
            const x = editDrawState.x + dx * t;
            const y = editDrawState.y + dy * t;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.beginPath();
    ctx.moveTo(editDrawState.x, editDrawState.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    editDrawState.x = point.x;
    editDrawState.y = point.y;
}
function circledNumber(n){ return n >= 1 && n <= 20 ? String.fromCharCode(0x2460 + n - 1) : String(n); }
function drawBrushShape(ctx, start, end){
    setupDrawStyle(ctx);
    const x = Math.min(start.x, end.x), y = Math.min(start.y, end.y), w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
    if(brushTool === 'rect') ctx.strokeRect(x, y, w, h);
    else if(brushTool === 'ellipse'){ ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, Math.max(1, w / 2), Math.max(1, h / 2), 0, 0, Math.PI * 2); ctx.stroke(); }
}
function drawNumberLabel(point){
    const ctx = editDrawCanvas().getContext('2d');
    const size = Math.max(18, editBrushSize() * 2.2);
    const text = circledNumber(brushLabelCounter++);
    setupDrawStyle(ctx);
    ctx.save(); ctx.font = `900 ${size}px Arial, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = Math.max(3, size / 8);
    ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.strokeText(text, point.x, point.y); ctx.fillStyle = brushColor(); ctx.fillText(text, point.x, point.y); ctx.restore();
}
function beginEditDraw(event){
    if(imageEditMode === 'crop') return;
    event.preventDefault(); event.stopPropagation();
    const canvasEl = editDrawCanvas();
    canvasEl.setPointerCapture?.(event.pointerId);
    const p = editDrawPoint(event);
    if(imageEditMode === 'grid'){
        if(gridOperationMode === 'join') return;
        if(!gridCustomMode) return;
        const hit = gridCustomLineHit(p);
        gridCustomHistory.push([...gridCustomLines.map(line => ({...line}))]);
        if(hit >= 0){ gridCustomDrag = {index:hit, pointerId:event.pointerId}; setGridCustomLinePos(hit, p); }
        else { gridCustomLines.push({type:gridCustomOrientation, pos:gridCustomOrientation === 'h' ? p.y / canvasEl.height : p.x / canvasEl.width}); gridCustomDrag = {index:gridCustomLines.length - 1, pointerId:event.pointerId}; }
        syncGridCustomUndoBtn(); refreshGridSplitPreview(); return;
    }
    const ctx = canvasEl.getContext('2d');
    pushEditDrawHistory();
    if(imageEditMode === 'brush' && brushTool === 'label'){ drawNumberLabel(p); editDrawState = null; canvasEl.releasePointerCapture?.(event.pointerId); return; }
    editDrawState = {x:p.x, y:p.y, sx:p.x, sy:p.y, pointerId:event.pointerId, snapshot:(imageEditMode === 'brush' && brushTool !== 'free') ? editDrawSnapshot() : null};
    setupDrawStyle(ctx);
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + .01, p.y + .01);
    if(imageEditMode === 'mask' || brushTool === 'free') ctx.stroke();
    normalizeMaskPreviewCanvas(canvasEl);
}
function moveEditDraw(event){
    if(imageEditMode === 'grid' && gridOperationMode === 'join') return;
    if(imageEditMode === 'grid' && gridCustomMode && gridCustomDrag){ event.preventDefault(); event.stopPropagation(); setGridCustomLinePos(gridCustomDrag.index, editDrawPoint(event)); refreshGridSplitPreview(); return; }
    if(!editDrawState || imageEditMode === 'crop' || imageEditMode === 'grid') return;
    event.preventDefault(); event.stopPropagation();
    const ctx = editDrawCanvas().getContext('2d');
    const p = editDrawPoint(event);
    if(imageEditMode === 'brush' && brushTool !== 'free'){ restoreEditDrawSnapshot(editDrawState.snapshot); drawBrushShape(ctx, {x:editDrawState.sx, y:editDrawState.sy}, p); return; }
    const events = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : [];
    if(events.length){
        events.forEach(ev => strokeFreeDrawPoint(editDrawPoint(ev)));
    } else {
        strokeFreeDrawPoint(p);
    }
    normalizeMaskPreviewCanvas();
}
function endEditDraw(event){
    if(editDrawState && event?.pointerId != null) editDrawCanvas().releasePointerCapture?.(event.pointerId);
    if(gridCustomDrag && event?.pointerId != null) editDrawCanvas().releasePointerCapture?.(event.pointerId);
    editDrawState = null; gridCustomDrag = null; syncEditDrawingHistoryButtons();
}
function beginGridJoinDrag(event){
    if(imageEditMode !== 'grid' || gridOperationMode !== 'join') return;
    const itemEl = event.target?.closest?.('.grid-join-item');
    if(!itemEl) return;
    event.preventDefault();
    event.stopPropagation();
    const index = Number(itemEl.dataset.gridJoinIndex);
    const item = gridJoinLayout?.items?.find(entry => Number(entry.index) === index);
    const host = document.getElementById('gridJoinCanvas');
    if(!item || !host) return;
    itemEl.setPointerCapture?.(event.pointerId);
    gridJoinDrag = {index, pointerId:event.pointerId, sx:event.clientX, sy:event.clientY, x:item.x, y:item.y};
    itemEl.classList.add('dragging');
}
function moveGridJoinDrag(event){
    if(!gridJoinDrag || imageEditMode !== 'grid' || gridOperationMode !== 'join') return;
    event.preventDefault();
    event.stopPropagation();
    const item = gridJoinLayout?.items?.find(entry => Number(entry.index) === Number(gridJoinDrag.index));
    if(!item) return;
    const host = document.getElementById('gridJoinCanvas');
    const rect = host?.getBoundingClientRect();
    const logical = gridJoinCanvasSize();
    const scale = rect ? Math.max(0.001, rect.width / Math.max(1, logical.w)) : Math.max(0.001, imageEditZoom || 1);
    const dx = (event.clientX - gridJoinDrag.sx) / scale;
    const dy = (event.clientY - gridJoinDrag.sy) / scale;
    gridJoinDrag.dx = dx;
    gridJoinDrag.dy = dy;
    const el = host?.querySelector(`[data-grid-join-index="${CSS.escape(String(gridJoinDrag.index))}"]`);
    if(el){
        el.style.transform = `translate(${Math.round(dx)}px, ${Math.round(dy)}px)`;
    }
}
function gridJoinDragTarget(){
    if(!gridJoinDrag || !gridJoinLayout) return null;
    const dragged = gridJoinLayout.items.find(entry => Number(entry.index) === Number(gridJoinDrag.index));
    if(!dragged) return null;
    const dx = gridJoinDrag.dx || 0;
    const dy = gridJoinDrag.dy || 0;
    const cx = dragged.x + dx + dragged.w / 2;
    const cy = dragged.y + dy + dragged.h / 2;
    return (gridJoinLayout.items || [])
        .filter(entry => Number(entry.index) !== Number(gridJoinDrag.index))
        .map(entry => {
            const inside = cx >= entry.x && cx <= entry.x + entry.w && cy >= entry.y && cy <= entry.y + entry.h;
            const score = Math.hypot(cx - (entry.x + entry.w / 2), cy - (entry.y + entry.h / 2));
            return {entry, inside, score};
        })
        .filter(item => item.inside || item.score < Math.max(dragged.w, dragged.h, item.entry.w, item.entry.h) * 0.55)
        .sort((a, b) => (b.inside - a.inside) || a.score - b.score)[0]?.entry || null;
}
function endGridJoinDrag(event){
    if(!gridJoinDrag) return;
    const host = document.getElementById('gridJoinCanvas');
    const draggedEl = host?.querySelector(`[data-grid-join-index="${CSS.escape(String(gridJoinDrag.index))}"]`);
    draggedEl?.classList.remove('dragging');
    if(draggedEl) draggedEl.style.transform = '';
    const dragged = gridJoinLayout?.items?.find(entry => Number(entry.index) === Number(gridJoinDrag.index));
    const target = gridJoinDragTarget();
    if(dragged && target){
        const order = gridJoinVisualOrder();
        const a = order.indexOf(Number(dragged.index));
        const b = order.indexOf(Number(target.index));
        if(a >= 0 && b >= 0) [order[a], order[b]] = [order[b], order[a]];
        setGridJoinLayoutOrder(order, gridJoinLayout.rows, gridJoinLayout.cols, gridJoinLayout.gap);
        gridJoinUserMoved = true;
        renderGridJoinPreview();
    }
    if(event?.pointerId != null) event.target?.releasePointerCapture?.(event.pointerId);
    gridJoinDrag = null;
}
function syncGridGapValue(){
    const input = document.getElementById('gridGapSize');
    const value = Math.max(0, Math.min(240, Number(input?.value || 0)));
    if(input) input.value = value;
    const label = document.getElementById('gridGapValue');
    if(label) label.textContent = String(value);
    if(gridJoinLayout && gridOperationMode === 'join'){
        const rows = gridJoinLayout.rows;
        const cols = gridJoinLayout.cols;
        const order = gridJoinVisualOrder();
        setGridJoinLayoutOrder(order, rows, cols, value);
    }
    return value;
}
function gridGapInputValue(){
    return Math.max(0, Math.min(240, Number(document.getElementById('gridGapSize')?.value || 0)));
}
function gridSplitSettings(){
    const hLines = Math.max(0, Math.min(20, Number(document.getElementById('gridHorizontalLines')?.value || 0)));
    const vLines = Math.max(0, Math.min(20, Number(document.getElementById('gridVerticalLines')?.value || 0)));
    return {rows:hLines + 1, cols:vLines + 1, gap:syncGridGapValue()};
}
function currentGridJoinItems(){
    // 分组拼接：聚合组内所有图片成员的图片，按阅读顺序给出连续索引（source 指向真实图片对象以写回自然尺寸）。
    if(gridJoinGroupId){
        const group = nodes.find(n => n.id === gridJoinGroupId && isSmartGroupNode(n));
        if(group){
            return smartGroupImageRefs(group)
                .filter(r => mediaKindForItem(r.item) === 'image' && r.item?.url)
                .map((r, index) => ({item:r.item, source:r.source, index}));
        }
    }
    const node = currentEditImage().node;
    return (node?.images || [])
        .map((item, index) => ({item:imageForDisplay(item), source:item, index}))
        .filter(entry => mediaKindForItem(entry.item) === 'image' && entry.item?.url);
}
// 从分组小菜单打开“宫格拼接”：锚定在分组第一张图片（保证编辑器有真实底图，不出现破图/尺寸异常），
// 但把拼接数据源切换到整个分组（gridJoinGroupId）。
function openGroupGridJoin(group){
    if(!isSmartGroupNode(group)) return;
    const refs = smartGroupImageRefs(group).filter(r => mediaKindForItem(r.item) === 'image');
    if(refs.length <= 1){ toast('分组至少需要 2 张图片才能宫格拼接'); return; }
    const first = refs[0];
    openImageEditor(first.nodeId, first.index);
    if(!imageEditModal.classList.contains('open')) return;
    gridJoinGroupId = group.id;
    setImageEditMode('grid', true);
    setGridOperationMode('join');
}
function canGridJoinCurrentNode(){
    return currentGridJoinItems().length > 1;
}
function gridJoinAutoDims(count){
    const cols = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, count))));
    return {rows:Math.max(1, Math.ceil(count / cols)), cols};
}
function gridJoinNaturalSize(entry){
    const item = entry?.item || {};
    const cached = gridJoinImageCache.get(entry?.index);
    const w = Number(item.natural_w || item.width || cached?.naturalWidth || 0);
    const h = Number(item.natural_h || item.height || cached?.naturalHeight || 0);
    return {w:Math.max(1, w || 512), h:Math.max(1, h || 512)};
}
function gridJoinBaseCellSize(items){
    const sizes = items.map(gridJoinNaturalSize);
    const maxW = Math.max(1, ...sizes.map(size => size.w));
    const maxH = Math.max(1, ...sizes.map(size => size.h));
    const scale = Math.min(1, 420 / Math.max(maxW, maxH));
    return {w:Math.max(1, Math.round(maxW * scale)), h:Math.max(1, Math.round(maxH * scale)), scale};
}
function gridJoinItemDisplaySize(entry, cell){
    return {
        w:Math.max(1, Math.round(cell.w)),
        h:Math.max(1, Math.round(cell.h))
    };
}
function ensureGridJoinLayout(rows=null, cols=null){
    const items = currentGridJoinItems();
    if(!items.length){ gridJoinLayout = null; return null; }
    const auto = gridJoinAutoDims(items.length);
    const nextRows = Math.max(1, Number(rows || gridJoinLayout?.rows || auto.rows) || auto.rows);
    const nextCols = Math.max(1, Number(cols || gridJoinLayout?.cols || auto.cols) || auto.cols);
    const byIndex = new Map(items.map(entry => [entry.index, entry]));
    const previousOrder = gridJoinVisualOrder()
        .map(index => byIndex.get(Number(index)))
        .filter(Boolean);
    const ordered = [
        ...previousOrder,
        ...items.filter(entry => !previousOrder.some(prev => Number(prev.index) === Number(entry.index)))
    ];
    const cell = gridJoinBaseCellSize(ordered);
    const gap = gridGapInputValue();
    const layoutItems = ordered.map((entry, order) => {
        const row = Math.floor(order / nextCols);
        const col = order % nextCols;
        const {w, h} = gridJoinItemDisplaySize(entry, cell);
        return {
            index:entry.index,
            x:col * (cell.w + gap),
            y:row * (cell.h + gap),
            w,
            h
        };
    });
    gridJoinLayout = {rows:nextRows, cols:nextCols, cellW:cell.w, cellH:cell.h, gap, items:layoutItems};
    return gridJoinLayout;
}
function gridJoinVisualOrder(layout=gridJoinLayout){
    return (layout?.items || [])
        .slice()
        .sort((a, b) => (Number(a.y || 0) - Number(b.y || 0)) || (Number(a.x || 0) - Number(b.x || 0)))
        .map(item => Number(item.index));
}
function setGridJoinLayoutOrder(order, rows=null, cols=null, gapOverride=null){
    const entries = currentGridJoinItems();
    if(!entries.length){ gridJoinLayout = null; return null; }
    const byIndex = new Map(entries.map(entry => [entry.index, entry]));
    const ordered = [
        ...order.map(index => byIndex.get(Number(index))).filter(Boolean),
        ...entries.filter(entry => !order.includes(entry.index))
    ];
    const auto = gridJoinAutoDims(ordered.length);
    const nextRows = Math.max(1, Number(rows || gridJoinLayout?.rows || auto.rows) || auto.rows);
    const nextCols = Math.max(1, Number(cols || gridJoinLayout?.cols || auto.cols) || auto.cols);
    const cell = gridJoinBaseCellSize(ordered);
    const gap = Math.max(0, Math.min(240, Number(gapOverride ?? document.getElementById('gridGapSize')?.value ?? 0)));
    const layoutItems = ordered.map((entry, orderIndex) => {
        const row = Math.floor(orderIndex / nextCols);
        const col = orderIndex % nextCols;
        const {w, h} = gridJoinItemDisplaySize(entry, cell);
        return {
            index:entry.index,
            x:col * (cell.w + gap),
            y:row * (cell.h + gap),
            w,
            h
        };
    });
    gridJoinLayout = {rows:nextRows, cols:nextCols, cellW:cell.w, cellH:cell.h, gap, items:layoutItems};
    return gridJoinLayout;
}
function resetGridJoinLayout(){
    gridJoinUserMoved = false;
    gridJoinLayout = null;
    ensureGridJoinLayout();
    renderGridJoinPreview();
}
function applyGridJoinPreset(rows, cols){
    gridJoinUserMoved = false;
    const order = gridJoinVisualOrder();
    if(order.length) setGridJoinLayoutOrder(order, rows, cols);
    else {
        gridJoinLayout = null;
        ensureGridJoinLayout(rows, cols);
    }
    renderGridJoinPreview();
}
function setGridJoinOutputSize(size){
    gridJoinOutputSize = Math.max(256, Math.min(8192, Number(size) || 2048));
    syncGridJoinSizeControls();
    refreshGridSplitPreview();
}
function syncGridJoinSizeControls(){
    document.querySelectorAll('[data-grid-join-size]').forEach(btn => {
        const active = Number(btn.dataset.gridJoinSize || 0) === Number(gridJoinOutputSize);
        btn.classList.toggle('active', active);
    });
}
function setGridOperationMode(mode){
    gridOperationMode = mode === 'join' && canGridJoinCurrentNode() ? 'join' : 'split';
    if(mode === 'join' && gridOperationMode !== 'join') toast('请从包含多张图片的分组打开宫格拼接');
    syncGridOperationControls();
    refreshGridSplitPreview();
}
function syncGridOperationControls(){
    const join = gridOperationMode === 'join';
    document.getElementById('gridSplitModeBtn')?.classList.toggle('primary', !join);
    document.getElementById('gridSplitModeBtn')?.classList.toggle('secondary', join);
    const joinBtn = document.getElementById('gridJoinModeBtn');
    if(joinBtn){
        joinBtn.disabled = !canGridJoinCurrentNode();
        joinBtn.classList.toggle('primary', join);
        joinBtn.classList.toggle('secondary', !join);
    }
    document.querySelectorAll('.grid-split-control').forEach(el => { el.style.display = join ? 'none' : (el.id === 'gridRegularControls' ? 'contents' : ''); });
    document.querySelectorAll('.grid-join-control').forEach(el => { el.style.display = join ? 'flex' : 'none'; });
    syncGridJoinSizeControls();
    if(!join) syncGridCustomControls();
    document.getElementById('cropCanvas')?.classList.toggle('grid-join-mode', join);
    document.getElementById('cropImage')?.classList.toggle('grid-join-hidden', join);
    if(join) ensureGridJoinLayout();
    else gridJoinDrag = null;
}
function gridSplitRects(width, height){
    if(gridCustomMode) return gridSplitRectsCustom(width, height);
    const {rows, cols, gap} = gridSplitSettings();
    const halfGap = gap / 2, rects = [];
    for(let row = 0; row < rows; row++){
        const topLine = row * height / rows, bottomLine = (row + 1) * height / rows;
        const y1 = Math.round(row === 0 ? 0 : topLine + halfGap), y2 = Math.round(row === rows - 1 ? height : bottomLine - halfGap);
        for(let col = 0; col < cols; col++){
            const leftLine = col * width / cols, rightLine = (col + 1) * width / cols;
            const x1 = Math.round(col === 0 ? 0 : leftLine + halfGap), x2 = Math.round(col === cols - 1 ? width : rightLine - halfGap);
            if(x2 > x1 && y2 > y1) rects.push({row, col, x:x1, y:y1, w:x2 - x1, h:y2 - y1});
        }
    }
    return rects;
}
function gridSplitRectsCustom(width, height){
    const gap = Math.max(0, Math.min(240, Number(document.getElementById('gridGapSize')?.value || 0)));
    const halfGap = gap / 2;
    const rawH = [...new Set(gridCustomLines.filter(l => l.type === 'h').map(l => l.pos * height))].sort((a, b) => a - b);
    const rawV = [...new Set(gridCustomLines.filter(l => l.type === 'v').map(l => l.pos * width))].sort((a, b) => a - b);
    const hCuts = [0, ...rawH, height], vCuts = [0, ...rawV, width], rects = [];
    for(let row = 0; row < hCuts.length - 1; row++) for(let col = 0; col < vCuts.length - 1; col++){
        const y1 = Math.round(row === 0 ? hCuts[row] : hCuts[row] + halfGap), y2 = Math.round(row === hCuts.length - 2 ? hCuts[row + 1] : hCuts[row + 1] - halfGap);
        const x1 = Math.round(col === 0 ? vCuts[col] : vCuts[col] + halfGap), x2 = Math.round(col === vCuts.length - 2 ? vCuts[col + 1] : vCuts[col + 1] - halfGap);
        if(x2 > x1 && y2 > y1) rects.push({row, col, x:x1, y:y1, w:x2 - x1, h:y2 - y1});
    }
    return rects;
}
function gridLayoutFromRects(rects){
    return {type:'grid-split', groupId:uid('grid'), rows:Math.max(1, ...rects.map(r => Number(r.row || 0) + 1)), cols:Math.max(1, ...rects.map(r => Number(r.col || 0) + 1))};
}
function applyGridPreset(rows, cols){
    gridCustomMode = false; gridCustomLines = []; gridCustomHistory = []; gridCustomDrag = null;
    const h = document.getElementById('gridHorizontalLines'), v = document.getElementById('gridVerticalLines');
    if(h){ h.disabled = false; h.value = String(Math.max(0, Number(rows || 1) - 1)); }
    if(v){ v.disabled = false; v.value = String(Math.max(0, Number(cols || 1) - 1)); }
    document.getElementById('gridCustomToggle')?.classList.remove('primary');
    document.getElementById('gridCustomToggle')?.classList.add('secondary');
    syncGridCustomControls();
    syncGridCustomCursor(); syncGridCustomUndoBtn(); refreshGridSplitPreview();
}
function syncGridCustomControls(){
    const join = gridOperationMode === 'join';
    const custom = document.getElementById('gridCustomControls');
    if(custom) custom.style.display = !join && gridCustomMode ? 'flex' : 'none';
    document.querySelectorAll('.grid-split-control.grid-preset-row').forEach(row => {
        row.style.display = !join && !gridCustomMode ? 'flex' : 'none';
    });
    const regular = document.getElementById('gridRegularControls');
    if(regular) regular.style.display = !join && !gridCustomMode ? 'contents' : 'none';
}
function toggleGridCustomMode(){
    gridCustomMode = !gridCustomMode;
    if(gridCustomMode){ gridCustomLines = []; gridCustomHistory = []; }
    gridCustomDrag = null;
    const toggle = document.getElementById('gridCustomToggle');
    toggle.classList.toggle('primary', gridCustomMode); toggle.classList.toggle('secondary', !gridCustomMode);
    ['gridHorizontalLines','gridVerticalLines'].forEach(id => { const el = document.getElementById(id); if(el) el.disabled = gridCustomMode; });
    syncGridCustomControls();
    syncGridCustomCursor(); syncGridCustomUndoBtn(); refreshGridSplitPreview();
}
function setGridCustomOrientation(orient){
    gridCustomOrientation = orient;
    document.getElementById('gridOrientH').classList.toggle('primary', orient === 'h');
    document.getElementById('gridOrientH').classList.toggle('secondary', orient !== 'h');
    document.getElementById('gridOrientV').classList.toggle('primary', orient === 'v');
    document.getElementById('gridOrientV').classList.toggle('secondary', orient !== 'v');
    syncGridCustomCursor();
}
function clearGridCustomLines(){ gridCustomHistory = []; gridCustomLines = []; gridCustomDrag = null; syncGridCustomUndoBtn(); refreshGridSplitPreview(); }
function undoGridCustomLine(){ if(!gridCustomHistory.length) return; gridCustomLines = gridCustomHistory.pop(); gridCustomDrag = null; syncGridCustomUndoBtn(); refreshGridSplitPreview(); }
function syncGridCustomUndoBtn(){
    const btn = document.getElementById('gridUndoBtn');
    if(!btn) return;
    btn.disabled = gridCustomHistory.length === 0;
    btn.style.opacity = gridCustomHistory.length === 0 ? '0.4' : '1';
}
function applyImageEditZoom(scaleOverride=null){
    ensureImageEditBaseSize();
    if(!imageEditBaseW) return;
    const img = document.getElementById('cropImage');
    const oldW = cropImageDisplaySize().w;
    img.style.maxWidth = 'none'; img.style.maxHeight = 'none';
    img.style.width = Math.round(imageEditBaseW * imageEditZoom) + 'px';
    img.style.height = Math.round(imageEditBaseH * imageEditZoom) + 'px';
    resizeEditDrawCanvas();
    if(cropState){
        const scale = Number(scaleOverride) || (oldW > 0 ? cropImageDisplaySize().w / oldW : 1);
        cropState.x = Math.round(cropState.x * scale); cropState.y = Math.round(cropState.y * scale);
        cropState.w = Math.round(cropState.w * scale); cropState.h = Math.round(cropState.h * scale);
        clampCrop(); renderCropBox();
    }
    if(imageEditMode === 'grid') refreshGridSplitPreview();
    syncImageEditOverflow(); updateZoomLabel();
}
function ensureImageEditBaseSize(force=false){
    if(imageEditBaseW && imageEditBaseH && !force) return;
    const img = document.getElementById('cropImage');
    const naturalW = img.naturalWidth || img.clientWidth || 0;
    const naturalH = img.naturalHeight || img.clientHeight || 0;
    if(!naturalW || !naturalH) return;
    const maxW = Math.max(1, Math.min(1300, window.innerWidth - 100));
    const maxH = Math.max(1, Math.min(840, window.innerHeight - 200));
    const fit = Math.min(1, maxW / naturalW, maxH / naturalH);
    imageEditBaseW = Math.max(1, Math.round(naturalW * fit));
    imageEditBaseH = Math.max(1, Math.round(naturalH * fit));
}
function syncImageEditOverflow(){
    const stage = document.getElementById('imageEditStage');
    const crop = document.getElementById('cropCanvas');
    if(!stage || !crop) return;
    const rect = crop.getBoundingClientRect(), pad = 36;
    stage.classList.toggle('overflow-x', rect.width + pad > stage.clientWidth);
    stage.classList.toggle('overflow-y', rect.height + pad > stage.clientHeight);
}
function resetImageEditZoom(){
    if(imageEditMode === 'preview'){
        if(panoramaState.enabled){
            resetPanoramaView();
            return;
        }
        resetPreviewTransform();
        return;
    }
    const stage = document.getElementById('imageEditStage');
    imageEditZoom = 1.0; applyImageEditZoom();
    if(stage){ stage.scrollLeft = 0; stage.scrollTop = 0; }
}
function updateZoomLabel(){
    const el = document.getElementById('imageEditZoomLabel');
    if(!el) return;
    if(imageEditMode === 'preview' && panoramaState.enabled){
        el.textContent = Math.round((75 / Math.max(1, panoramaState.fov)) * 100) + '%';
        return;
    }
    el.textContent = Math.round((imageEditMode === 'preview' ? previewZoom : imageEditZoom) * 100) + '%';
}
function syncGridCustomCursor(){
    const el = document.getElementById('cropCanvas');
    el.classList.toggle('grid-custom-h', imageEditMode === 'grid' && gridOperationMode !== 'join' && gridCustomMode && gridCustomOrientation === 'h');
    el.classList.toggle('grid-custom-v', imageEditMode === 'grid' && gridOperationMode !== 'join' && gridCustomMode && gridCustomOrientation === 'v');
}
function gridJoinCanvasSize(layout=gridJoinLayout){
    if(!layout) return {w:1, h:1};
    const gap = Math.max(0, Number(layout.gap || 0));
    const byGrid = {
        w:Math.max(1, Number(layout.cols || 1) * Number(layout.cellW || 1) + Math.max(0, Number(layout.cols || 1) - 1) * gap),
        h:Math.max(1, Number(layout.rows || 1) * Number(layout.cellH || 1) + Math.max(0, Number(layout.rows || 1) - 1) * gap)
    };
    const byItems = (layout.items || []).reduce((acc, item) => ({
        w:Math.max(acc.w, Number(item.x || 0) + Number(item.w || 0)),
        h:Math.max(acc.h, Number(item.y || 0) + Number(item.h || 0))
    }), byGrid);
    return {w:Math.ceil(byItems.w), h:Math.ceil(byItems.h)};
}
function renderGridJoinPreview(){
    const host = document.getElementById('gridJoinCanvas');
    const countEl = document.getElementById('gridSplitCount');
    const cropCanvasEl = document.getElementById('cropCanvas');
    if(!host) return;
    host.innerHTML = '';
    if(imageEditMode !== 'grid' || gridOperationMode !== 'join'){
        host.style.display = 'none';
        if(cropCanvasEl){ cropCanvasEl.style.width = ''; cropCanvasEl.style.height = ''; }
        return;
    }
    const items = currentGridJoinItems();
    if(items.length <= 1){
        host.style.display = 'none';
        if(cropCanvasEl){ cropCanvasEl.style.width = ''; cropCanvasEl.style.height = ''; }
        if(countEl) countEl.textContent = '分组需要至少 2 张图片';
        return;
    }
    const layout = ensureGridJoinLayout();
    const size = gridJoinCanvasSize(layout);
    const zoom = Math.max(0.05, Number(imageEditZoom || 1));
    const displayW = Math.max(1, Math.round(size.w * zoom));
    const displayH = Math.max(1, Math.round(size.h * zoom));
    host.style.display = 'block';
    host.style.width = `${Math.max(1, Math.round(size.w))}px`;
    host.style.height = `${Math.max(1, Math.round(size.h))}px`;
    host.style.transform = `scale(${zoom})`;
    host.style.transformOrigin = '0 0';
    if(cropCanvasEl){
        cropCanvasEl.style.width = `${displayW}px`;
        cropCanvasEl.style.height = `${displayH}px`;
    }
    const byIndex = new Map(items.map(entry => [entry.index, entry]));
    (layout.items || []).forEach(item => {
        const entry = byIndex.get(item.index);
        if(!entry) return;
        const img = document.createElement('img');
        img.className = 'grid-join-item';
        img.draggable = false;
        img.dataset.gridJoinIndex = String(item.index);
        img.style.left = `${Math.round(item.x)}px`;
        img.style.top = `${Math.round(item.y)}px`;
        img.style.width = `${Math.round(item.w)}px`;
        img.style.height = `${Math.round(item.h)}px`;
        img.alt = entry.item.name || `image-${item.index + 1}`;
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const hadNaturalSize = Boolean(entry.source.natural_w && entry.source.natural_h);
            gridJoinImageCache.set(item.index, img);
            if(!entry.source.natural_w && img.naturalWidth) entry.source.natural_w = img.naturalWidth;
            if(!entry.source.natural_h && img.naturalHeight) entry.source.natural_h = img.naturalHeight;
            if(!hadNaturalSize && img.naturalWidth && img.naturalHeight && imageEditMode === 'grid' && gridOperationMode === 'join'){
                ensureGridJoinLayout();
                renderGridJoinPreview();
            }
        };
        img.onerror = () => {
            if(img.dataset.proxyFallbackTried === '1') return;
            const fallback = proxiedMediaUrl(entry.item);
            if(!fallback || fallback === img.getAttribute('src')) return;
            img.dataset.proxyFallbackTried = '1';
            img.src = fallback;
        };
        img.src = displayMediaUrl(entry.item);
        host.appendChild(img);
    });
    if(countEl) countEl.textContent = `将拼接 ${items.length} 张图片 · 输出长边 ${Math.round(gridJoinOutputSize / 1024)}K`;
}
function refreshGridSplitPreview(){
    const canvasEl = editDrawCanvas();
    const ctx = canvasEl.getContext('2d');
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    renderGridJoinPreview();
    if(imageEditMode !== 'grid') return;
    if(gridOperationMode === 'join') return;
    const countEl = document.getElementById('gridSplitCount');
    const lineWidth = Math.max(2, Math.round(Math.min(canvasEl.width, canvasEl.height) / 320));
    const drawLine = (x1, y1, x2, y2) => {
        ctx.save(); ctx.lineWidth = lineWidth + 2; ctx.strokeStyle = 'rgba(2,6,23,0.72)'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.lineWidth = lineWidth; ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
    };
    if(gridCustomMode){
        const gap = Math.max(0, Math.min(240, Number(document.getElementById('gridGapSize')?.value || 0)));
        const hLines = gridCustomLines.filter(l => l.type === 'h'), vLines = gridCustomLines.filter(l => l.type === 'v');
        if(countEl) countEl.textContent = tr('canvas.gridWillOutput').replace('{n}', (hLines.length + 1) * (vLines.length + 1));
        hLines.forEach(l => { const y = l.pos * canvasEl.height; gap > 0 ? (drawLine(0, y - gap / 2, canvasEl.width, y - gap / 2), drawLine(0, y + gap / 2, canvasEl.width, y + gap / 2)) : drawLine(0, y, canvasEl.width, y); });
        vLines.forEach(l => { const x = l.pos * canvasEl.width; gap > 0 ? (drawLine(x - gap / 2, 0, x - gap / 2, canvasEl.height), drawLine(x + gap / 2, 0, x + gap / 2, canvasEl.height)) : drawLine(x, 0, x, canvasEl.height); });
        return;
    }
    const {rows, cols, gap} = gridSplitSettings();
    if(countEl) countEl.textContent = tr('canvas.gridWillOutput').replace('{n}', rows * cols);
    for(let i = 1; i < cols; i++){ const x = i * canvasEl.width / cols; gap > 0 ? (drawLine(x - gap / 2, 0, x - gap / 2, canvasEl.height), drawLine(x + gap / 2, 0, x + gap / 2, canvasEl.height)) : drawLine(x, 0, x, canvasEl.height); }
    for(let i = 1; i < rows; i++){ const y = i * canvasEl.height / rows; gap > 0 ? (drawLine(0, y - gap / 2, canvasEl.width, y - gap / 2), drawLine(0, y + gap / 2, canvasEl.width, y + gap / 2)) : drawLine(0, y, canvasEl.width, y); }
}
function renderCropBox(){
    if(!cropState) return;
    const cropCanvasEl = document.getElementById('cropCanvas');
    const img = document.getElementById('cropImage');
    const draw = editDrawCanvas();
    const textCanvas = editTextCanvas();
    let boxX = cropState.x;
    let boxY = cropState.y;
    if(imageEditMode === 'outpaint' && cropCanvasEl && img){
        cropCanvasEl.style.width = `${Math.round(cropState.w)}px`;
        cropCanvasEl.style.height = `${Math.round(cropState.h)}px`;
        img.style.position = 'absolute';
        img.style.left = `${Math.round(cropState.x)}px`;
        img.style.top = `${Math.round(cropState.y)}px`;
        boxX = 0;
        boxY = 0;
        if(draw){
            draw.style.left = img.style.left;
            draw.style.top = img.style.top;
        }
        if(textCanvas){
            textCanvas.style.left = img.style.left;
            textCanvas.style.top = img.style.top;
        }
        updateOutpaintResolutionLabel();
    } else if(cropCanvasEl && img){
        cropCanvasEl.style.width = '';
        cropCanvasEl.style.height = '';
        img.style.position = '';
        img.style.left = '';
        img.style.top = '';
        if(draw){
            draw.style.left = '';
            draw.style.top = '';
        }
        if(textCanvas){
            textCanvas.style.left = '';
            textCanvas.style.top = '';
        }
    }
    const box = document.getElementById('cropBox');
    if(box){
        box.style.left = `${boxX}px`; box.style.top = `${boxY}px`; box.style.width = `${cropState.w}px`; box.style.height = `${cropState.h}px`;
    }
    const outpaintFrame = document.getElementById('outpaintFrame');
    if(outpaintFrame){
        outpaintFrame.style.left = imageEditMode === 'outpaint' ? '0px' : `${boxX}px`;
        outpaintFrame.style.top = imageEditMode === 'outpaint' ? '0px' : `${boxY}px`;
        outpaintFrame.style.width = `${cropState.w}px`;
        outpaintFrame.style.height = `${cropState.h}px`;
    }
}
function outpaintNaturalSize(){
    const img = document.getElementById('cropImage');
    if(!img || !cropState) return {w:1, h:1};
    const display = cropImageDisplaySize();
    const scaleX = Math.max(1, Number(img.naturalWidth || 1)) / Math.max(1, Number(display.w || img.clientWidth || 1));
    const scaleY = Math.max(1, Number(img.naturalHeight || 1)) / Math.max(1, Number(display.h || img.clientHeight || 1));
    return {
        w:Math.max(1, Math.round((cropState.w || 1) * scaleX)),
        h:Math.max(1, Math.round((cropState.h || 1) * scaleY))
    };
}
function updateOutpaintResolutionLabel(){
    const label = document.getElementById('outpaintResolution');
    const cropCanvasEl = document.getElementById('cropCanvas');
    if(!label || !cropState) return;
    const size = outpaintNaturalSize();
    const warning = exceedsFourKStandard(size.w, size.h);
    cropCanvasEl?.classList.toggle('outpaint-warning', warning);
    label.textContent = `${Math.round(size.w)} x ${Math.round(size.h)}`;
}
function clampOutpaint(){
    if(!cropState) return;
    const {w, h} = cropBounds();
    cropState.w = Math.max(w, cropState.w);
    cropState.h = Math.max(h, cropState.h);
    cropState.x = Math.min(cropState.w - w, Math.max(0, cropState.x));
    cropState.y = Math.min(cropState.h - h, Math.max(0, cropState.y));
}
function resetOutpaintBox(){
    if(!cropState) return;
    ensureImageEditBaseSize(true);
    applyImageEditZoom();
    const {w, h} = cropBounds();
    cropState.w = w;
    cropState.h = h;
    cropState.x = 0;
    cropState.y = 0;
    clampOutpaint();
    renderCropBox();
}
function resetCropBox(){
    if(!cropState) return;
    if(imageEditMode === 'outpaint') return resetOutpaintBox();
    const {w, h} = cropBounds();
    cropState.x = Math.round(w * 0.08); cropState.y = Math.round(h * 0.08); cropState.w = Math.round(w * 0.84); cropState.h = Math.round(h * 0.84);
    renderCropBox();
}
function updatePreviewNavButtons(){
    let count;
    if(previewNavState.groupId && Array.isArray(previewNavState.seq)){
        count = previewNavState.seq.length;
    } else {
        const node = nodes.find(n => n.id === previewNavState.nodeId);
        count = Math.max(0, (node?.images || []).filter(img => img?.url).length);
    }
    previewNavState.count = count;
    const show = imageEditModal.classList.contains('open') && imageEditMode === 'preview' && count > 1;
    document.getElementById('previewPrevBtn')?.classList.toggle('visible', show);
    document.getElementById('previewNextBtn')?.classList.toggle('visible', show);
}
function navigatePreviewImage(delta){
    if(!imageEditModal.classList.contains('open') || imageEditMode !== 'preview') return;
    // 分组预览：跨成员节点按整组序列左右切换（openImageEditor 会重置 previewNavState，故切换后重新挂回分组上下文）。
    if(previewNavState.groupId && Array.isArray(previewNavState.seq) && previewNavState.seq.length > 1){
        const groupId = previewNavState.groupId;
        const seq = previewNavState.seq;
        const pos = (Number(previewNavState.seqPos || 0) + Number(delta || 0) + seq.length) % seq.length;
        const ref = seq[pos];
        openImageEditor(ref.nodeId, ref.index);
        if(imageEditModal.classList.contains('open')){
            previewNavState.groupId = groupId;
            previewNavState.seq = seq;
            previewNavState.seqPos = pos;
            // openImageEditor 重置了 previewNavState，需在恢复分组上下文后重算导航/下载全部按钮。
            setImageEditMode('preview');
        }
        return;
    }
    const node = nodes.find(n => n.id === previewNavState.nodeId);
    const images = (node?.images || []).filter(img => img?.url);
    if(!node || images.length <= 1) return;
    const count = images.length;
    const next = (Number(previewNavState.index || 0) + Number(delta || 0) + count) % count;
    openImageEditor(node.id, next);
}
function openImagePreview(nodeId, imageIndex=0){
    openImageEditor(nodeId, imageIndex);
    setImageEditMode('preview');
}
// 双击组内图片时按整组预览；非分组成员退回单节点预览。
function openImagePreviewSmart(nodeId, imageIndex=0){
    const group = smartGroupContainingNode(nodeId);
    if(group){
        openGroupImagePreview(group, nodeId, imageIndex);
        return;
    }
    openImagePreview(nodeId, imageIndex);
}
// 打开整组图片预览：以被双击图片为起点，左右切换遍历分组内所有图片。
function openGroupImagePreview(group, startNodeId, startIndex=0){
    if(!isSmartGroupNode(group)){ openImagePreview(startNodeId, startIndex); return; }
    const refs = smartGroupImageRefs(group);
    if(refs.length <= 1){ openImagePreview(startNodeId, startIndex); return; }
    const seq = refs.map(r => ({nodeId:r.nodeId, index:r.index}));
    let pos = seq.findIndex(s => s.nodeId === startNodeId && Number(s.index) === Number(startIndex));
    if(pos < 0) pos = 0;
    openImagePreview(seq[pos].nodeId, seq[pos].index);
    if(!imageEditModal.classList.contains('open')) return;
    previewNavState.groupId = group.id;
    previewNavState.seq = seq;
    previewNavState.seqPos = pos;
    // 恢复分组上下文后重算导航/下载全部按钮（openImageEditor 已把 previewNavState 重置成单节点态）。
    setImageEditMode('preview');
}
function openImageEditor(nodeId, imageIndex=0){
    const node = nodes.find(n => n.id === nodeId);
    const image = imageForDisplay(node?.images?.[imageIndex]);
    if(!image?.url) return;
    const kind = mediaKindForItem(image);
    if(kind !== 'image' && kind !== 'video'){
        downloadPreviewFile(image);
        return;
    }
    selectedId = nodeId;
    selectedImage = {nodeId, index:imageIndex};
    previewNavState = {nodeId, index:imageIndex, count:(node.images || []).filter(img => img?.url).length};
    cropState = {nodeId, imageIndex, x:0, y:0, w:0, h:0};
    gridCustomMode = false; gridCustomLines = []; gridCustomHistory = []; gridCustomDrag = null; gridCustomOrientation = 'h';
    gridOperationMode = 'split'; gridJoinLayout = null; gridJoinDrag = null; gridJoinImageCache = new Map(); gridJoinUserMoved = false; gridJoinGroupId = '';
    imageEditZoom = 1.0; imageEditBaseW = 0; imageEditBaseH = 0; imageEditModeTouched = false;
    editTextItems = []; editTextSelectedId = ''; editTextDrag = null; editTextDirty = false;
    const toggle = document.getElementById('gridCustomToggle');
    if(toggle){ toggle.classList.add('secondary'); toggle.classList.remove('primary'); }
    syncGridCustomControls();
    syncGridOperationControls();
    ['gridHorizontalLines','gridVerticalLines'].forEach(id => { const el = document.getElementById(id); if(el) el.disabled = false; });
    const orientH = document.getElementById('gridOrientH'), orientV = document.getElementById('gridOrientV');
    if(orientH){ orientH.classList.add('primary'); orientH.classList.remove('secondary'); }
    if(orientV){ orientV.classList.add('secondary'); orientV.classList.remove('primary'); }
    syncGridCustomUndoBtn(); updateZoomLabel();
    const img = document.getElementById('cropImage');
    img.style.width = ''; img.style.height = ''; img.style.maxWidth = ''; img.style.maxHeight = '';
    imageEditModal.classList.add('open');
    previewCompareOn = false;
    previewCompareIndex = -1;
    disposePanoramaPreview();
    resetPreviewTransform();
    if(kind === 'video'){
        img.onload = null;
        img.onerror = null;
        img.removeAttribute('src');
        delete img.dataset.proxyFallbackTried;
        setImageEditMode('preview');
        updatePreviewNavButtons();
        refreshIcons();
        return;
    }
    // 原图加载失败时的兜底链：依次尝试 download-output 代理、缩略图同款的 media-preview 代理（PIL 渲染，
    // 对截断/半下载的文件比浏览器宽容，所以缩略图能显示而原图破损时它仍能出图）。兜底时去掉 crossOrigin——
    // 预览不需要导出画布，带 crossOrigin 反而会因跨域/CORS 直接加载失败。
    const primaryEditorSrc = displayMediaUrl(image);
    const editorFallbackUrls = [proxiedMediaUrl(image), smartMediaPreviewUrl(image, 2048)]
        .filter(Boolean)
        .filter((u, i, arr) => u !== primaryEditorSrc && arr.indexOf(u) === i);
    let editorFallbackIndex = 0;
    img.onload = () => {
        const targetImage = node.images?.[imageIndex];
        // 兜底用的是代理/缩放图，naturalWidth 不是原图真实尺寸，别污染节点的 natural_w/h。
        if(editorFallbackIndex === 0 && targetImage && img.naturalWidth && img.naturalHeight && (!targetImage.natural_w || !targetImage.natural_h)){
            targetImage.natural_w = img.naturalWidth;
            targetImage.natural_h = img.naturalHeight;
            scheduleSave();
        }
        imageEditBaseW = img.clientWidth; imageEditBaseH = img.clientHeight;
        updateZoomLabel(); resizeEditDrawCanvas(); resetEditDrawingHistory(); clearEditDrawing(true); resetCropBox();
        if(!imageEditModeTouched) setImageEditMode('preview');
        else refreshComparePanel();
        if(!panoramaState.enabled) updatePreviewMetaHint();
        syncImageEditOverflow(); refreshIcons();
    };
    img.onerror = () => {
        if(editorFallbackIndex >= editorFallbackUrls.length) return;
        img.src = editorFallbackUrls[editorFallbackIndex++];
    };
    // 不设 crossOrigin：displayMediaUrl 已把所有地址收敛为同源（http 走本地代理），同源图片不会污染画布，
    // 裁剪/涂抹等导出操作照常可用。而带 crossOrigin 会让浏览器对“缩略图已无 CORS 缓存的同源图”重新发起
    // CORS 请求并失败——表现就是预览先闪一下（命中缓存）随即变成破损图。
    img.removeAttribute('crossorigin');
    img.src = primaryEditorSrc;
    setImageEditMode('preview');
    updatePreviewNavButtons();
    refreshIcons();
}
function closeImageEditor(){
    cleanupSmartLogPreviewNode();
    imageEditModal.classList.remove('open');
    document.querySelector('.image-edit-panel')?.classList.remove('video-preview-mode');
    const img = document.getElementById('cropImage');
    const previewVideo = document.getElementById('previewCurrentVideo');
    img.onload = null; img.onerror = null; img.removeAttribute('src'); delete img.dataset.proxyFallbackTried; img.style.width = ''; img.style.height = ''; img.style.maxWidth = ''; img.style.maxHeight = '';
    img.style.position = ''; img.style.left = ''; img.style.top = '';
    if(previewVideo){
        previewVideo.pause?.();
        previewVideo.onloadedmetadata = null;
        previewVideo.onloadeddata = null;
        previewVideo.removeAttribute('src');
        previewVideo.load?.();
        previewVideo.style.display = 'none';
    }
    clearEditDrawing(true);
    cropState = null; cropDrag = null; editDrawState = null; resetEditDrawingHistory(); gridCustomDrag = null; gridJoinDrag = null; gridJoinLayout = null; gridJoinImageCache = new Map(); gridJoinUserMoved = false; gridOperationMode = 'split'; gridJoinGroupId = '';
    previewNavState = {nodeId:'', index:0, count:0};
    imageEditZoom = 1.0; imageEditBaseW = 0; imageEditBaseH = 0; imageEditModeTouched = false;
    disposePanoramaPreview();
    previewPanDrag = null; previewCompareDrag = false; imageEditPanDrag = null; resetPreviewTransform();
    document.getElementById('imageEditStage')?.classList.remove('overflow-x', 'overflow-y', 'preview-mode');
    const cropCanvasEl = document.getElementById('cropCanvas');
    cropCanvasEl?.classList.remove('grid-custom-h', 'grid-custom-v', 'outpaint-mode', 'outpaint-warning', 'dragging-image', 'text-mode');
    cropCanvasEl?.classList.remove('grid-join-mode');
    document.getElementById('cropImage')?.classList.remove('grid-join-hidden');
    const joinCanvas = document.getElementById('gridJoinCanvas');
    if(joinCanvas){ joinCanvas.innerHTML = ''; joinCanvas.style.display = 'none'; joinCanvas.style.width = ''; joinCanvas.style.height = ''; }
    if(cropCanvasEl){ cropCanvasEl.style.width = ''; cropCanvasEl.style.height = ''; }
    const textCanvas = editTextCanvas();
    if(textCanvas){ textCanvas.style.left = ''; textCanvas.style.top = ''; }
    updatePreviewNavButtons();
}
function clampCrop(){
    if(!cropState) return;
    if(imageEditMode === 'outpaint') return clampOutpaint();
    const {w, h} = cropBounds();
    cropState.w = Math.max(24, Math.min(cropState.w, w)); cropState.h = Math.max(24, Math.min(cropState.h, h));
    cropState.x = Math.max(0, Math.min(cropState.x, w - cropState.w)); cropState.y = Math.max(0, Math.min(cropState.y, h - cropState.h));
}
function beginCropDrag(event, mode){
    if(!cropState) return;
    event.preventDefault(); event.stopPropagation();
    if(imageEditMode === 'outpaint' && mode === 'move') return;
    cropDrag = {mode, sx:event.clientX, sy:event.clientY, start:{...cropState}};
}
function resizeOutpaintFromDrag(dx, dy){
    const start = cropDrag?.start;
    if(!start) return;
    let growX = 0, growY = 0;
    if(cropDrag.mode === 'outpaint-left') growX = -dx;
    else if(cropDrag.mode === 'outpaint-right') growX = dx;
    else if(cropDrag.mode === 'outpaint-top') growY = -dy;
    else if(cropDrag.mode === 'outpaint-bottom') growY = dy;
    else if(cropDrag.mode === 'outpaint-corner'){ growX = dx; growY = dy; }
    const {w, h} = cropBounds();
    const nextW = Math.max(w, start.w + growX * 2);
    const nextH = Math.max(h, start.h + growY * 2);
    cropState.w = nextW;
    cropState.h = nextH;
    cropState.x = start.x + Math.round((nextW - start.w) / 2);
    cropState.y = start.y + Math.round((nextH - start.h) / 2);
    clampOutpaint();
}
async function uploadCroppedBlob(blob, name){
    const form = new FormData();
    form.append('files', blob, name);
    const data = await fetch('/api/ai/upload', {method:'POST', body:form}).then(r => r.json());
    return data.files?.[0];
}
async function uploadImageBlobs(blobs){
    const form = new FormData();
    blobs.forEach(item => form.append('files', item.blob, item.name));
    const data = await fetch('/api/ai/upload', {method:'POST', body:form}).then(r => r.json());
    return data.files || [];
}
function replaceEditedImage(file){
    const {node, index} = currentEditImage();
    if(!node || !file) return false;
    node.images[index] = {...(node.images[index] || {}), url:file.url, name:file.name, kind:file.kind || mediaKindForItem(file), natural_w:0, natural_h:0};
    if((node.images || []).length === 1){ delete node.w; delete node.h; }
    selectedId = node.id; selectedImage = {nodeId:node.id, index};
    return true;
}
function applyOutpaintSizeToSmartParams(width, height){
    const w = Math.max(1, Math.round(Number(width) || 0));
    const h = Math.max(1, Math.round(Number(height) || 0));
    if(!w || !h) return;
    const subject = currentEditImage().node;
    if(!subject || !isSmartImageNode(subject)) return;
    subject.outpaintSize = {width:w, height:h};
    subject.runSettings = withOutpaintDisplaySettings(subject, cloneSmartSettings(subject.runSettings || settings));
    if(activeSettingsSubject()?.id === subject.id){
        settings = smartSettingsForNode(subject);
        renderDynamicParams();
    }
}
async function applyImageCrop(){
    if(!cropState) return;
    const {node, image} = currentEditImage();
    const img = document.getElementById('cropImage');
    if(!node || !image || !img.naturalWidth || !img.naturalHeight) return;
    const scaleX = img.naturalWidth / (img.clientWidth || 1), scaleY = img.naturalHeight / (img.clientHeight || 1);
    const sx = Math.max(0, Math.round(cropState.x * scaleX)), sy = Math.max(0, Math.round(cropState.y * scaleY));
    const sw = Math.max(1, Math.round(cropState.w * scaleX)), sh = Math.max(1, Math.round(cropState.h * scaleY));
    const canvasEl = document.createElement('canvas');
    canvasEl.width = sw; canvasEl.height = sh;
    canvasEl.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    const blob = await new Promise(resolve => canvasEl.toBlob(resolve, 'image/png'));
    const base = (image.name || 'image').replace(/\.[^.]+$/, '');
    const file = blob ? await uploadCroppedBlob(blob, `${base}_crop.png`) : null;
    if(file && replaceEditedImage(file)){ closeImageEditor(); render(); scheduleSave(); }
}
async function applyImageOutpaint(){
    if(!cropState) return;
    const {node, image} = currentEditImage();
    const img = document.getElementById('cropImage');
    if(!node || !image || !img.naturalWidth || !img.naturalHeight) return;
    clampOutpaint();
    const scaleX = img.naturalWidth / (img.clientWidth || 1), scaleY = img.naturalHeight / (img.clientHeight || 1);
    const outW = Math.max(img.naturalWidth, Math.round(cropState.w * scaleX));
    const outH = Math.max(img.naturalHeight, Math.round(cropState.h * scaleY));
    const dx = Math.round(cropState.x * scaleX);
    const dy = Math.round(cropState.y * scaleY);
    const canvasEl = document.createElement('canvas');
    canvasEl.width = outW; canvasEl.height = outH;
    const ctx = canvasEl.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outW, outH);
    ctx.drawImage(img, dx, dy, img.naturalWidth, img.naturalHeight);
    const blob = await new Promise(resolve => canvasEl.toBlob(resolve, 'image/png'));
    const base = (image.name || 'image').replace(/\.[^.]+$/, '');
    const file = blob ? await uploadCroppedBlob(blob, `${base}_outpaint.png`) : null;
    if(file && replaceEditedImage(file)){
        applyOutpaintSizeToSmartParams(outW, outH);
        setPromptDraftForNode(node, 'Remove white area and fill the scene');
        promptInput.dataset.preserveDraftOnce = '1';
        closeImageEditor();
        render();
        scheduleSave();
    }
}
async function applyImageMask(){
    if(!cropState || !editCanvasHasPixels()) return;
    const {node, image} = currentEditImage();
    if(!node || !image) return;
    const mask = maskCanvasFromDrawCanvas(editDrawCanvas());
    const blob = await new Promise(resolve => mask.toBlob(resolve, 'image/png'));
    const base = (image.name || 'image').replace(/\.[^.]+$/, '');
    const file = blob ? await uploadCroppedBlob(blob, `${base}_mask.png`) : null;
    if(file){
        node.images.push({url:file.url, name:file.name, role:'mask'});
        selectedId = node.id; selectedImage = {nodeId:node.id, index:node.images.length - 1};
        closeImageEditor(); render(); scheduleSave();
    }
}
function maskCanvasFromDrawCanvas(src){
    const mask = document.createElement('canvas');
    mask.width = src.width;
    mask.height = src.height;
    const srcCtx = src.getContext('2d');
    const srcData = srcCtx.getImageData(0, 0, src.width, src.height);
    const ctx = mask.getContext('2d');
    const out = ctx.createImageData(mask.width, mask.height);
    for(let i = 0; i < srcData.data.length; i += 4){
        const painted = srcData.data[i + 3] > 8;
        const v = painted ? 255 : 0;
        out.data[i] = v;
        out.data[i + 1] = v;
        out.data[i + 2] = v;
        out.data[i + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    return mask;
}
async function applyImageBrush(){
    if(!cropState) return;
    removeEditTextInlineEditor(true);
    if(!editCanvasHasPixels()) return;
    const {node, image} = currentEditImage();
    const img = document.getElementById('cropImage');
    if(!node || !image || !img.naturalWidth || !img.naturalHeight) return;
    const canvasEl = document.createElement('canvas');
    canvasEl.width = img.naturalWidth; canvasEl.height = img.naturalHeight;
    const ctx = canvasEl.getContext('2d');
    ctx.drawImage(img, 0, 0, canvasEl.width, canvasEl.height); ctx.drawImage(editDrawCanvas(), 0, 0); ctx.drawImage(editTextCanvas(), 0, 0);
    const blob = await new Promise(resolve => canvasEl.toBlob(resolve, 'image/png'));
    const base = (image.name || 'image').replace(/\.[^.]+$/, '');
    const file = blob ? await uploadCroppedBlob(blob, `${base}_paint.png`) : null;
    if(file && replaceEditedImage(file)){ closeImageEditor(); render(); scheduleSave(); }
}
async function applyImageGridSplit(){
    if(!cropState) return;
    if(gridOperationMode === 'join') return applyImageGridJoin();
    const {node, image} = currentEditImage();
    const img = document.getElementById('cropImage');
    if(!node || !image || !img.naturalWidth || !img.naturalHeight) return;
    const rects = gridSplitRects(img.naturalWidth, img.naturalHeight).sort((a, b) => (Number(a.row || 0) - Number(b.row || 0)) || (Number(a.col || 0) - Number(b.col || 0)));
    if(!rects.length) return;
    const base = safeExportFileName((downloadNameForMediaItem(image, 'image') || 'image').replace(/\.[^.]+$/, ''), 'image');
    const digits = String(rects.length).length;
    const blobs = [];
    for(let i = 0; i < rects.length; i++){
        const rect = rects[i];
        const canvasEl = document.createElement('canvas');
        canvasEl.width = rect.w; canvasEl.height = rect.h;
        canvasEl.getContext('2d').drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
        const blob = await new Promise(resolve => canvasEl.toBlob(resolve, 'image/png'));
        const order = String(i + 1).padStart(digits, '0');
        if(blob) blobs.push({blob, name:`${base}_${order}_r${rect.row + 1}_c${rect.col + 1}.png`});
    }
    const files = await uploadImageBlobs(blobs);
    if(files.length){
        const layout = gridLayoutFromRects(rects);
        const outputNode = createNode((node.x || 0) + imageLayout(node.images || [], nodeScale(node), node).width + 40, node.y || 0, files.map((file, i) => ({
            url:file.url,
            name:file.name,
            grid:{...layout, row:rects[i]?.row || 0, col:rects[i]?.col || 0, w:rects[i]?.w || 1, h:rects[i]?.h || 1}
        })));
        outputNode.title = 'Grid';
        closeImageEditor(); render(); scheduleSave();
    }
}
function loadGridJoinImage(entry){
    const cached = gridJoinImageCache.get(entry.index);
    if(cached?.complete && cached.naturalWidth) return Promise.resolve(cached);
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            gridJoinImageCache.set(entry.index, img);
            resolve(img);
        };
        img.onerror = () => {
            if(img.dataset.proxyFallbackTried === '1'){
                reject(new Error('图片加载失败'));
                return;
            }
            const fallback = proxiedMediaUrl(entry.item);
            if(!fallback || fallback === img.src){
                reject(new Error('图片加载失败'));
                return;
            }
            img.dataset.proxyFallbackTried = '1';
            img.src = fallback;
        };
        img.src = displayMediaUrl(entry.item);
    });
}
function drawImageCover(ctx, img, dx, dy, dw, dh){
    const sw = Math.max(1, Number(img?.naturalWidth || img?.videoWidth || img?.width || 1));
    const sh = Math.max(1, Number(img?.naturalHeight || img?.videoHeight || img?.height || 1));
    const targetW = Math.max(1, Number(dw || 1));
    const targetH = Math.max(1, Number(dh || 1));
    const scale = Math.max(targetW / sw, targetH / sh);
    const cropW = Math.max(1, targetW / scale);
    const cropH = Math.max(1, targetH / scale);
    const sx = Math.max(0, (sw - cropW) / 2);
    const sy = Math.max(0, (sh - cropH) / 2);
    ctx.drawImage(img, sx, sy, cropW, cropH, dx, dy, targetW, targetH);
}
async function applyImageGridJoin(){
    const {node, image} = currentEditImage();
    const items = currentGridJoinItems();
    if(!node || items.length <= 1){ toast('请从包含多张图片的分组打开宫格拼接'); return; }
    const layout = ensureGridJoinLayout();
    if(!layout?.items?.length) return;
    const size = gridJoinCanvasSize(layout);
    const targetLong = Math.max(256, Number(gridJoinOutputSize) || 2048);
    const outputScale = Math.max(1, targetLong / Math.max(1, Math.max(size.w, size.h)));
    const canvasEl = document.createElement('canvas');
    canvasEl.width = Math.max(1, Math.round(size.w * outputScale));
    canvasEl.height = Math.max(1, Math.round(size.h * outputScale));
    const ctx = canvasEl.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
    const byIndex = new Map(items.map(entry => [entry.index, entry]));
    for(const item of layout.items || []){
        const entry = byIndex.get(item.index);
        if(!entry) continue;
        const img = await loadGridJoinImage(entry);
        drawImageCover(ctx, img, Math.round(item.x * outputScale), Math.round(item.y * outputScale), Math.round(item.w * outputScale), Math.round(item.h * outputScale));
    }
    const blob = await new Promise(resolve => canvasEl.toBlob(resolve, 'image/png'));
    const base = safeExportFileName((downloadNameForMediaItem(image || items[0]?.item, 'image') || 'image').replace(/\.[^.]+$/, ''), 'image');
    const file = blob ? await uploadCroppedBlob(blob, `${base}_join.png`) : null;
    if(file){
        const rect = nodeRect(node);
        const outputNode = createImageNodeAt({x:rect.x + rect.width + 240, y:rect.y + rect.height / 2}, [{
            url:file.url,
            name:file.name,
            kind:'image',
            natural_w:canvasEl.width,
            natural_h:canvasEl.height
        }], {select:true, skipUndo:true});
        outputNode.title = 'Grid Join';
        closeImageEditor();
        render();
        scheduleSave();
        toast('已输出拼接图片');
    }
}
function applyImageEdit(){
    if(imageEditMode === 'preview') return;
    if(imageEditMode === 'outpaint') return applyImageOutpaint();
    if(imageEditMode === 'mask') return applyImageMask();
    if(imageEditMode === 'brush') return applyImageBrush();
    if(imageEditMode === 'grid') return applyImageGridSplit();
    return applyImageCrop();
}
let lastComposerNodeId = '';
let activeComposerSubject = null;
function currentComposerSubject(){
    return selectedNode();
}
function savePromptDraftForCurrent(){
    if(promptInput?.dataset?.promptLocked === '1') return;
    const subject = activeComposerNode();
    if(!subject) return;
    if(composer?.classList?.contains('generated-prompt-mode') && isGeneratedImagePromptComposerNode(subject)){
        subject.promptDraftText = String(subject.text || '');
        subject.promptDraftHtml = escapeHtml(subject.promptDraftText);
        subject.runSettings = cloneSmartSettings(settings);
        return;
    }
    if(promptInput?.dataset?.preserveDraftOnce === '1' && subject.promptDraftHtml){
        delete promptInput.dataset.preserveDraftOnce;
        return;
    }
    subject.promptDraftHtml = promptInput.innerHTML;
    subject.promptDraftText = promptPlainText();
    subject.runSettings = cloneSmartSettings(settings);
}
function setPromptDraftForNode(node, text){
    if(!isSmartRunnableNode(node)) return;
    const value = String(text || '');
    node.promptDraftHtml = escapeHtml(value);
    node.promptDraftText = value;
    node.promptDraftTouched = true;
    if(activeSettingsSubject()?.id === node.id && promptInput){
        promptInput.textContent = value;
        delete promptInput.dataset.preserveDraftOnce;
    }
}
function loadPromptDraft(subject){
    if(subject?.promptDraftHtml){
        const hasToken = String(subject.promptDraftHtml || '').includes('mention-image-token');
        promptInput.innerHTML = hasToken
            ? subject.promptDraftHtml
            : (promptHtmlWithMentionTokens(subject.runPrompt || subject.promptDraftText || '', subject.runPromptRefs || []) || subject.promptDraftHtml);
    } else if(typeof subject?.runPrompt === 'string'){
        const rebuilt = promptHtmlWithMentionTokens(subject.runPrompt, subject.runPromptRefs || []);
        if(rebuilt) promptInput.innerHTML = rebuilt;
        else setPromptText(subject.runPrompt);
    } else {
        setPromptText('');
    }
}
function generatedImagePromptComposerHtml(node){
    ensureGeneratedImagePromptComposerState(node);
    node.llmEnabled = node.llmEnabled !== false;
    node.llmSystemEnabled = node.llmSystemEnabled === true;
    node.promptSplitEnabled = node.promptSplitEnabled === true;
    node.cameraEnabled = node.cameraEnabled === true;
    node.promptSeparator = promptNodeSeparator(node);
    const refs = generatedImagePromptReferences(node);
    const promptItems = promptNodePromptItems(node);
    const systemPrompt = String(node.llmSystemPrompt || '').trim();
    const cameraControlHtml = promptNodeCameraControlHtml(node);
    const refThumbs = smartNodeInputThumbsHtml(refs, {labelPrefix:'图'});
    const running = node.promptRematching === true;
    const editBaseWeight = generatedEditBaseReferenceWeight(node);
    const showGeneratedLlmSystemControls = false;
    const generatedLlmSystemToggleHtml = showGeneratedLlmSystemControls
        ? `<button class="prompt-node-pill prompt-node-control prompt-system-toggle ${node.llmSystemEnabled ? 'active' : ''}" type="button"><i data-lucide="${node.llmSystemEnabled ? 'toggle-right' : 'toggle-left'}"></i><span>${node.llmSystemEnabled ? '关闭系统提示词' : '启用系统提示词'}</span></button>`
        : '';
    const generatedLlmSystemPromptHtml = showGeneratedLlmSystemControls && node.llmSystemEnabled
        ? `<textarea class="prompt-node-control prompt-llm-system" placeholder="系统提示词">${escapeHtml(systemPrompt || 'You revise image-edit prompts while preserving the current generated image according to the current reference weight.')}</textarea>`
        : '';
    const llmPanel = node.llmEnabled ? `
        <div class="prompt-node-llm generated-image-llm">
            <select class="prompt-node-control prompt-llm-provider">${chatProviderOptions(node.llmProvider)}</select>
            <select class="prompt-node-control prompt-llm-model">${chatModelOptions(node.llmModel, node.llmProvider)}</select>
            <div class="prompt-llm-instruction-wrap">
                <textarea class="prompt-node-control prompt-llm-instruction" placeholder="输入这次要修改的需求，运行后会用 GPT-5.5 替换上方提示词">${escapeHtml(node.llmInstruction || '')}</textarea>
            </div>
            <div class="prompt-node-llm-actions">
                <button class="prompt-node-run prompt-node-control generated-image-rematch-run" type="button" ${running ? 'disabled' : ''}><i data-lucide="${running ? 'loader-2' : 'play'}"></i><span>${running ? '匹配中' : '运行'}</span></button>
                ${generatedLlmSystemToggleHtml}
                <span class="generated-rematch-note">只更新提示词，不自动生图</span>
            </div>
            ${generatedLlmSystemPromptHtml}
        </div>` : '';
    return `
        <div class="prompt-node-card generated-image-prompt-card">
            <div class="generated-edit-base-banner"><i data-lucide="scan"></i><span>当前生成图 = 编辑基准；默认 100%，可手动调整参考权重；运行只用 GPT-5.5 重匹配并替换提示词</span></div>
            <textarea class="prompt-node-text generated-image-prompt-text" placeholder="当前图片的可编辑提示词">${escapeHtml(node.text || '')}</textarea>
            <div class="prompt-node-tools">
                <button class="prompt-node-pill prompt-node-control prompt-preset-edit" type="button"><i data-lucide="library"></i><span>模板库</span></button>
                <button class="prompt-node-pill prompt-node-control prompt-split-toggle ${node.promptSplitEnabled ? 'active' : ''}" type="button"><i data-lucide="split"></i><span>分隔符</span></button>
                <button class="prompt-node-pill prompt-node-control prompt-poster-copy-toggle ${node.posterCopyEnabled ? 'active' : ''}" type="button"><i data-lucide="type"></i><span>海报文案</span></button>
                <button class="prompt-node-pill prompt-node-control prompt-camera-toggle ${node.cameraEnabled ? 'active' : ''}" type="button"><i data-lucide="camera"></i><span>相机</span></button>
                <button class="prompt-node-pill prompt-node-control prompt-llm-toggle ${node.llmEnabled ? 'active' : ''}" type="button"><i data-lucide="sparkles"></i><span>LLM</span></button>
            </div>
            <label class="prompt-style-weight prompt-node-control generated-edit-base-weight" title="默认 100%，可手动调整当前生成图作为后续参考的结构权重">
                <span><i data-lucide="sliders-horizontal"></i>当前生成图结构权重</span>
                <input class="generated-edit-base-weight-range" type="range" min="0" max="100" step="5" value="${editBaseWeight}">
                <strong class="generated-edit-base-weight-value">${editBaseWeight}%</strong>
            </label>
            ${cameraControlHtml}
            ${node.promptSplitEnabled ? `
                <div class="prompt-node-split-row">
                    <label class="prompt-node-split-control prompt-node-control"><span>分隔符</span><input class="prompt-node-separator" type="text" value="${escapeHtml(node.promptSeparator)}" maxlength="8"></label>
                    <span class="prompt-node-split-count">${promptItems.length || 0} 段</span>
                </div>
                <div class="prompt-node-segments generated-image-prompt-segments">${promptItems.map((item, index) => `<div class="prompt-node-segment"><span>${index + 1}</span><p>${escapeHtml(item)}</p></div>`).join('')}</div>
            ` : ''}
            ${refThumbs}
            ${llmPanel}
        </div>`;
}
function renderGeneratedImagePromptComposer(node){
    if(!generatedPromptComposer) return;
    if(!isGeneratedImagePromptComposerNode(node)){
        generatedPromptComposer.innerHTML = '';
        return;
    }
    generatedPromptComposer.innerHTML = generatedImagePromptComposerHtml(node);
    const panel = generatedPromptComposer;
    panel.querySelectorAll('.prompt-node-control, .prompt-node-pill').forEach(control => {
        control.addEventListener('mousedown', event => event.stopPropagation());
        control.addEventListener('click', event => event.stopPropagation());
        control.addEventListener('dblclick', event => event.stopPropagation());
    });
    const textEl = panel.querySelector('.generated-image-prompt-text');
    if(textEl){
        bindScrollableText(textEl);
        textEl.oninput = event => {
            node.text = event.target.value;
            node.promptDraftText = node.text;
            node.promptDraftHtml = escapeHtml(node.text);
            scheduleSave();
        };
    }
    const presetEdit = panel.querySelector('.prompt-preset-edit');
    if(presetEdit) presetEdit.onclick = event => {
        event.preventDefault();
        editPromptPresetForNode(node);
    };
    const splitToggle = panel.querySelector('.prompt-split-toggle');
    if(splitToggle) splitToggle.onclick = event => {
        event.preventDefault();
        node.promptSplitEnabled = node.promptSplitEnabled !== true;
        renderGeneratedImagePromptComposer(node);
        scheduleSave();
    };
    const separatorEl = panel.querySelector('.prompt-node-separator');
    if(separatorEl) separatorEl.oninput = event => {
        node.promptSeparator = event.target.value || ';';
        renderGeneratedImagePromptComposer(node);
        scheduleSave();
    };
    const posterToggle = panel.querySelector('.prompt-poster-copy-toggle');
    if(posterToggle) posterToggle.onclick = event => {
        event.preventDefault();
        node.posterCopyEnabled = !node.posterCopyEnabled;
        renderGeneratedImagePromptComposer(node);
        scheduleSave();
    };
    const cameraToggle = panel.querySelector('.prompt-camera-toggle');
    if(cameraToggle) cameraToggle.onclick = event => {
        event.preventDefault();
        node.cameraEnabled = node.cameraEnabled !== true;
        if(node.cameraEnabled) ensurePromptNodeCameraDefaults(node);
        renderGeneratedImagePromptComposer(node);
        scheduleSave();
    };
    const cameraFocal = panel.querySelector('.prompt-camera-focal');
    if(cameraFocal) cameraFocal.oninput = event => {
        node.cameraFocalLength = promptNodeCameraFocalLength({cameraFocalLength:event.target.value});
        refreshPromptCameraControlUi(panel, node);
        scheduleSave();
    };
    bindPromptCameraRig(panel, node);
    const editBaseWeightEl = panel.querySelector('.generated-edit-base-weight-range');
    if(editBaseWeightEl) editBaseWeightEl.oninput = event => {
        const value = Math.max(0, Math.min(100, Math.round(Number(event.target.value) || 0)));
        node.referenceWeight = value;
        node.generatedEditBaseReferenceWeight = value;
        node.styleMatch = {...(node.styleMatch || {}), referenceWeight:value};
        node.imageEditRefs = generatedImagePromptReferences(node);
        const valueEl = panel.querySelector('.generated-edit-base-weight-value');
        if(valueEl) valueEl.textContent = `${value}%`;
        scheduleSave();
    };
    const llmToggle = panel.querySelector('.prompt-llm-toggle');
    if(llmToggle) llmToggle.onclick = event => {
        event.preventDefault();
        node.llmEnabled = node.llmEnabled === false;
        renderGeneratedImagePromptComposer(node);
        scheduleSave();
    };
    const providerEl = panel.querySelector('.prompt-llm-provider');
    if(providerEl) providerEl.onchange = event => {
        node.llmProvider = resolveChatProviderId(event.target.value);
        node.llmModel = preferredPromptRematchModel(node.llmProvider);
        renderGeneratedImagePromptComposer(node);
        scheduleSave();
    };
    const modelEl = panel.querySelector('.prompt-llm-model');
    if(modelEl) modelEl.onchange = event => {
        node.llmModel = event.target.value;
        scheduleSave();
    };
    const instructionEl = panel.querySelector('.prompt-llm-instruction');
    if(instructionEl){
        bindScrollableText(instructionEl);
        instructionEl.oninput = event => {
            node.llmInstruction = event.target.value;
            scheduleSave();
        };
    }
    const systemToggle = panel.querySelector('.prompt-system-toggle');
    if(systemToggle) systemToggle.onclick = event => {
        event.preventDefault();
        node.llmSystemEnabled = !node.llmSystemEnabled;
        renderGeneratedImagePromptComposer(node);
        scheduleSave();
    };
    const systemEl = panel.querySelector('.prompt-llm-system');
    if(systemEl){
        bindScrollableText(systemEl);
        systemEl.oninput = event => {
            node.llmSystemPrompt = event.target.value;
            scheduleSave();
        };
    }
    const runEl = panel.querySelector('.generated-image-rematch-run');
    if(runEl) runEl.onclick = event => {
        event.preventDefault();
        runGeneratedImagePromptRematch(node.id);
    };
    bindSmartPreviewImageFallbacks(panel);
    refreshIcons();
}
function positionComposerForNode(node){
    if(!node) return;
    const rect = nodeRect(node);
    const gap = 14;
    const cardW = isGeneratedImagePromptComposerNode(node) ? 390 : 540;
    composer.style.width = `${cardW}px`;
    composer.style.left = `${rect.x + rect.width / 2 - cardW / 2}px`;
    composer.style.top = `${rect.y + rect.height + gap}px`;
}
function updateComposer(){
    const node = selectedNode();
    syncRunButtonState(node);
    if(smartCascadeSilentSelection && !activeComposerSubject){
        composer.classList.remove('open');
        composer.classList.remove('generated-prompt-mode');
        if(cascadeRunBtn) cascadeRunBtn.style.display = 'none';
        activeComposerSubject = null;
        lastComposerNodeId = '';
        return;
    }
    composer.classList.toggle('open', !!node);
    if(!isSmartRunnableNode(node)){
        if(cascadeRunBtn) cascadeRunBtn.style.display = 'none';
        savePromptDraftForCurrent();
        composer.classList.remove('open');
        composer.classList.remove('generated-prompt-mode');
        if(generatedPromptComposer) generatedPromptComposer.innerHTML = '';
        activeComposerSubject = null;
        lastComposerNodeId = '';
        setPromptInputLocked(false);
        if(!node) setPromptText('');
        syncComposerPromptMatchButton();
        return;
    }
    const generatedPromptMode = isGeneratedImagePromptComposerNode(node);
    composer.classList.toggle('generated-prompt-mode', generatedPromptMode);
    if(generatedPromptMode){
        const subject = ensureGeneratedImagePromptComposerState(node);
        const composerKey = `${node.id}:generated-prompt`;
        if(lastComposerNodeId !== composerKey) savePromptDraftForCurrent();
        lastComposerNodeId = composerKey;
        activeComposerSubject = subject;
        setPromptInputLocked(false);
        if(cascadeRunBtn) cascadeRunBtn.style.display = 'none';
        positionComposerForNode(node);
        renderGeneratedImagePromptComposer(node);
        syncComposerPromptMatchButton();
        return;
    }
    if(generatedPromptComposer) generatedPromptComposer.innerHTML = '';
    // composer 只绑定节点本身：图片只是素材/结果，不携带提示词或参数状态。
    const subject = node;
    const composerKey = `${node.id}:node`;
    const switchedNode = lastComposerNodeId !== composerKey;
    if(switchedNode) savePromptDraftForCurrent();
    lastComposerNodeId = composerKey;
    activeComposerSubject = subject;
    const hasPromptInput = promptInputNodesFor(node).length > 0;
    if(switchedNode){
        settings = smartSettingsForNode(subject);
        loadPromptDraft(subject);
    }
    setPromptInputLocked(false);
    syncCascadeRunButton(node);
    positionComposerForNode(node);
    const ph = Math.max(60, Math.min(380, Number(settings.promptH) || 124));
    promptInput.style.setProperty('--prompt-h', `${ph}px`);
    renderInputThumbsRow(node);
    renderInputPromptPreview(node);
    syncCascadeRunButton(node);
    syncComposerPromptMatchButton();
    updateProviderModels();
}
function renderInputPromptPreview(node){
    if(!inputPromptPreview) return;
    const groupText = isSmartGroupNode(node) ? textForNode(node).trim() : '';
    const text = node ? [groupText, inputPromptTextFor(node).trim()].filter(Boolean).join('\n\n') : '';
    inputPromptPreview.classList.toggle('has-text', Boolean(text));
    inputPromptPreview.innerHTML = text
        ? `<div class="input-prompt-preview-label">${escapeHtml(tr('smart.inputUpstream'))}</div><div class="input-prompt-preview-text">${escapeHtml(text)}</div>`
        : '';
}
function renderInputThumbsRow(node){
    if(!inputThumbsRow) return;
    syncJimengModelPillForRefs();
    syncJimengVideoModelPillForRefs();
    const dedup = node ? visibleReferenceImagesFor(node) : [];
    const manualRefKeys = new Set(manualReferenceImagesFor(node).map(img => inputRefKey(img)));
    const addActive = mentionInsertMode === 'manual-ref';
    // 仅当参考图集合/状态真正变化时才重建缩略图 DOM。否则每敲一个字都重建并重新解码所有图片，
    // 参考图多时会让输入框打字明显卡顿。
    const thumbsSignature = JSON.stringify({
        node: node?.id || '',
        items: dedup.map(img => `${inputRefKey(img)}@${img.url || ''}`),
        manual: [...manualRefKeys],
        add: addActive,
        mode: node ? smartImageMode(node) : ''
    });
    if(inputThumbsRow.dataset.thumbsSig === thumbsSignature) return;
    inputThumbsRow.dataset.thumbsSig = thumbsSignature;
    inputThumbsRow.classList.toggle('has-items', Boolean(node));
    if(!node){ inputThumbsRow.innerHTML = ''; return; }
    const addButton = `<button class="input-thumb-add ${addActive ? 'active' : ''}" type="button" data-input-add-reference title="${escapeHtml(addActive ? '收起参考图' : '添加参考图')}" aria-label="${escapeHtml(addActive ? '收起参考图' : '添加参考图')}"><i data-lucide="image-plus"></i></button>`;
    if(!dedup.length){
        inputThumbsRow.innerHTML = `<div class="input-thumb-list empty"></div><div class="input-thumb-actions">${addButton}</div>`;
        bindInputThumbReferenceActions();
        refreshIcons();
        return;
    }
    const mediaCounters = {image:0, video:0, audio:0, text:0, file:0};
    const thumbsHtml = dedup.map((img, i) => {
        const isVid = isVideoMediaItem(img);
        const kind = mediaKindForItem(img);
        const isSelf = node ? isSelfReferenceForNode(node, img) : false;
        const title = isSelf
            ? tr('smart.inputSelf')
            : (smartImageMode(node) === 'workflow' ? tr('smart.inputUpstreamWorkflow') : tr('smart.inputUpstream'));
        const inner = kind === 'audio'
            ? `<div class="input-thumb-audio"><i data-lucide="file-audio"></i></div>`
            : isVid
            ? smartVideoPreviewHtml(img, 256, 'draggable="false" alt=""')
            : smartPreviewImgHtml(img, 256, 'draggable="false"');
        const count = (mediaCounters[kind] = (mediaCounters[kind] || 0) + 1);
        const label = kind === 'audio' ? `音频${count}` : kind === 'video' ? `视频${count}` : `图${count}`;
        const sourceUrl = img.originalLocalUrl || img.url || '';
        const key = inputRefKey(img);
        const removable = manualRefKeys.has(key);
        const removeBtn = removable ? `<button class="input-thumb-remove" type="button" data-input-remove-reference="${escapeHtml(inputRefKey(img))}" title="删除参考图" aria-label="删除参考图">×</button>` : '';
        return `<div class="input-thumb ${isSelf ? 'input-self' : ''} ${removable ? 'input-manual-ref' : ''}" draggable="false" data-thumb-index="${i}" data-node-id="${escapeHtml(img.nodeId || '')}" data-image-index="${img.imageIndex ?? ''}" data-url="${escapeHtml(img.url || '')}" data-source-url="${escapeHtml(sourceUrl)}" data-ref-role="${escapeHtml(img.role || '')}" title="${escapeHtml(`${img.name || tr('smart.inputNum').replace('{n}', String(i + 1))} · ${title}`)}">${inner}<span class="input-thumb-label">${escapeHtml(label)}</span>${removeBtn}</div>`;
    }).join('');
    inputThumbsRow.innerHTML = `<div class="input-thumb-list">${thumbsHtml}${dedup.length > 1 ? `<span class="input-thumb-count">${escapeHtml(tr('smart.inputCount').replace('{n}', String(dedup.length)))}</span>` : ''}</div><div class="input-thumb-actions">${addButton}</div>`;
    bindSmartPreviewImageFallbacks(inputThumbsRow);
    bindInputThumbsDrag(node, dedup, manualRefKeys);
    bindInputThumbReferenceActions();
    refreshIcons();
}
function bindInputThumbReferenceActions(){
    inputThumbsRow?.querySelectorAll('[data-input-add-reference]').forEach(btn => {
        btn.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            toggleAssetMentionPickerFromThumbs();
        });
    });
    inputThumbsRow?.querySelectorAll('[data-input-remove-reference]').forEach(btn => {
        btn.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            removeManualReferenceFromSelectedNode(btn.dataset.inputRemoveReference || '');
        });
    });
}
function bindInputThumbsDrag(node, items, manualRefKeys=new Set()){
    if(!inputThumbsRow) return;
    let thumbDragIndex = -1;
    inputThumbsRow.querySelectorAll('.input-thumb').forEach(el => {
        const index = Number(el.dataset.thumbIndex || -1);
        const item = items[index];
        const key = inputRefKey(item);
        const canReorderManual = items.length > 1 && manualRefKeys.has(key);
        const canReorderSource = items.length > 1 && Boolean(item?.nodeId);
        el.draggable = canReorderManual || canReorderSource;
        el.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
        });
        if(!el.draggable) return;
        el.addEventListener('dragstart', e => {
            e.stopPropagation();
            thumbDragIndex = index;
            el.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            if(canReorderManual) e.dataTransfer.setData('application/x-smart-manual-ref', key);
            else e.dataTransfer.setData('application/x-smart-input-thumb', String(index));
        });
        el.addEventListener('dragend', e => {
            e.stopPropagation();
            thumbDragIndex = -1;
            clearInputThumbDropMarkers();
            el.classList.remove('dragging');
        });
        el.addEventListener('dragover', e => {
            const manualFromKey = e.dataTransfer.getData('application/x-smart-manual-ref');
            if(manualFromKey){
                if(!manualRefKeys.has(key) || manualFromKey === key) return;
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'move';
                clearInputThumbDropMarkers();
                const placement = inputThumbDropPlacement(el, e);
                el.dataset.dropPlacement = placement;
                el.classList.add(placement === 'before' ? 'drop-before' : 'drop-after');
                return;
            }
            const rawFrom = e.dataTransfer.getData('application/x-smart-input-thumb');
            const from = rawFrom === '' ? thumbDragIndex : Number(rawFrom);
            if(!Number.isFinite(from) || from < 0 || from === index || !items[index]?.nodeId) return;
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            clearInputThumbDropMarkers();
            const placement = inputThumbDropPlacement(el, e);
            el.dataset.dropPlacement = placement;
            el.classList.add(placement === 'before' ? 'drop-before' : 'drop-after');
        });
        el.addEventListener('dragleave', e => {
            if(el.contains(e.relatedTarget)) return;
            delete el.dataset.dropPlacement;
            el.classList.remove('drop-before', 'drop-after');
        });
        el.addEventListener('drop', e => {
            const manualFromKey = e.dataTransfer.getData('application/x-smart-manual-ref');
            if(manualFromKey){
                if(!manualRefKeys.has(key) || manualFromKey === key) return;
                e.preventDefault();
                e.stopPropagation();
                const placement = inputThumbDropPlacement(el, e);
                clearInputThumbDropMarkers();
                reorderManualInputRefs(node, manualFromKey, key, placement);
                return;
            }
            const rawFrom = e.dataTransfer.getData('application/x-smart-input-thumb');
            const from = rawFrom === '' ? thumbDragIndex : Number(rawFrom);
            if(!Number.isFinite(from) || from < 0 || from === index || !items[index]?.nodeId) return;
            e.preventDefault();
            e.stopPropagation();
            const placement = inputThumbDropPlacement(el, e);
            clearInputThumbDropMarkers();
            reorderInputThumb(node, items, from, index, placement);
        });
    });
}
function reorderManualInputRefs(currentNode, fromKey, targetKey, placement='before'){
    if(!currentNode || !fromKey || !targetKey || fromKey === targetKey) return false;
    const refs = Array.isArray(currentNode.manualInputRefs) ? currentNode.manualInputRefs.slice() : [];
    const from = refs.findIndex(item => inputRefKey(item) === fromKey);
    const target = refs.findIndex(item => inputRefKey(item) === targetKey);
    if(from < 0 || target < 0 || from === target) return false;
    pushUndo();
    const [moved] = refs.splice(from, 1);
    let insertAt = refs.findIndex(item => inputRefKey(item) === targetKey);
    if(insertAt < 0) return false;
    if(placement === 'after') insertAt += 1;
    refs.splice(insertAt, 0, moved);
    currentNode.manualInputRefs = refs;
    if(inputThumbsRow) delete inputThumbsRow.dataset.thumbsSig;
    renderInputThumbsRow(currentNode);
    scheduleSave();
    return true;
}
function inputThumbDropPlacement(el, event){
    const rect = el.getBoundingClientRect();
    return event.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
}
function clearInputThumbDropMarkers(){
    inputThumbsRow?.querySelectorAll('.input-thumb.drop-before,.input-thumb.drop-after,.input-thumb.dragging')
        .forEach(el => {
            delete el.dataset.dropPlacement;
            el.classList.remove('drop-before', 'drop-after', 'dragging');
        });
}
function bindInputThumbVideoActions(){
    inputThumbsRow?.querySelectorAll('[data-manual-video-url]').forEach(btn => {
        btn.onclick = async event => {
            event.preventDefault();
            event.stopPropagation();
            try {
                await setCurrentSmartManualVideoUrl();
            } catch(e) {
                toast((e.message || '设置视频网址失败').slice(0, 180));
            }
        };
    });
    inputThumbsRow?.querySelectorAll('[data-temp-sh-upload-video]').forEach(btn => {
        btn.onclick = async event => {
            event.preventDefault();
            event.stopPropagation();
            try {
                await uploadCurrentSmartVideosToCloud();
            } catch(e) {
                toast((e.message || '云端上传失败').slice(0, 180));
            }
        };
    });
}
function movedBeforeAfterIds(ids, movedId, targetId, placement='before'){
    const list = (ids || []).filter(Boolean);
    const from = list.indexOf(movedId);
    const target = list.indexOf(targetId);
    if(from < 0 || target < 0 || movedId === targetId) return list;
    const [moved] = list.splice(from, 1);
    let insertAt = list.indexOf(targetId);
    if(insertAt < 0) return ids || [];
    if(placement === 'after') insertAt += 1;
    list.splice(insertAt, 0, moved);
    return list;
}
function sameOrderedIds(a, b){
    if((a || []).length !== (b || []).length) return false;
    return (a || []).every((id, index) => id === b[index]);
}
function reorderInputSourceNodes(currentNode, movedId, targetId, placement='before'){
    if(!currentNode || !movedId || !targetId || movedId === targetId) return false;
    const sourceNodes = smartImageUsesWorkflowInput(currentNode, smartLoopContext)
        ? workflowInputNodesFor(currentNode)
        : inputNodesFor(currentNode);
    const sourceIds = sourceNodes.map(n => n.id).filter(Boolean);
    if(!sourceIds.includes(movedId) || !sourceIds.includes(targetId)) return false;
    const nextIds = movedBeforeAfterIds(sourceIds, movedId, targetId, placement);
    if(sameOrderedIds(sourceIds, nextIds)) return false;
    const oldExplicitIds = Array.isArray(currentNode.inputNodeIds) ? currentNode.inputNodeIds.filter(Boolean) : [];
    currentNode.inputNodeIds = [
        ...nextIds.filter(id => oldExplicitIds.includes(id)),
        ...oldExplicitIds.filter(id => !nextIds.includes(id))
    ];
    if(canvas && Array.isArray(canvas.connections)){
        const order = new Map(nextIds.map((id, index) => [id, index]));
        const relevantSlots = new Set();
        const relevant = [];
        canvas.connections.forEach((conn, index) => {
            const kind = conn?.kind || 'flow';
            if(conn?.to === currentNode.id && ['input', 'flow'].includes(kind) && order.has(conn.from)){
                relevantSlots.add(index);
                relevant.push({conn, index});
            }
        });
        if(relevant.length){
            relevant.sort((a, b) => (order.get(a.conn.from) - order.get(b.conn.from)) || (a.index - b.index));
            let cursor = 0;
            canvas.connections = canvas.connections.map((conn, index) => relevantSlots.has(index) ? relevant[cursor++].conn : conn);
        }
    }
    return true;
}
function reorderInputThumb(currentNode, items, from, to, placement='before'){
    // items are already sourced from inputImagesFor → multiple source nodes possible.
    // Reorder within a source group's images first; separate input nodes use the
    // current node's input order, with a visual-position swap as a final fallback.
    if(from < 0 || to < 0 || from >= items.length || to >= items.length) return;
    // 强制让缩略图条在重排后重建（绕过 renderInputThumbsRow 的“无变化跳过”缓存），否则顺序看起来没变。
    if(inputThumbsRow) delete inputThumbsRow.dataset.thumbsSig;
    const fromImg = items[from];
    const toImg = items[to];
    if(!fromImg || !toImg) return;
    if(fromImg.nodeId === toImg.nodeId){
        const src = nodes.find(n => n.id === fromImg.nodeId);
        if(!src) return;
        pushUndo();
        const fi = Number(fromImg.imageIndex);
        const ti = Number(toImg.imageIndex);
        if(Number.isFinite(fi) && Number.isFinite(ti) && (src.images || [])[fi]){
            const arr = src.images;
            let insertAt = Math.max(0, Math.min(arr.length, ti + (placement === 'after' ? 1 : 0)));
            const item = arr.splice(fi, 1)[0];
            if(fi < insertAt) insertAt -= 1;
            arr.splice(Math.max(0, Math.min(arr.length, insertAt)), 0, item);
        }
        render();
        scheduleSave();
        return;
    }
    // 分组：缩略图来自各成员节点，跨成员拖动应改变 group.items 的成员顺序（= 图1234 的编号顺序），
    // 而不是去交换节点的画布位置（那只改了图层上下层级）。
    if(isSmartGroupNode(currentNode) && Array.isArray(currentNode.items)
        && fromImg.nodeId !== toImg.nodeId
        && currentNode.items.includes(fromImg.nodeId) && currentNode.items.includes(toImg.nodeId)){
        const next = movedBeforeAfterIds(currentNode.items.slice(), fromImg.nodeId, toImg.nodeId, placement);
        if(!sameOrderedIds(currentNode.items, next)){
            pushUndo();
            currentNode.items = next;
            if(inputThumbsRow) delete inputThumbsRow.dataset.thumbsSig;
            render();
            scheduleSave();
        }
        return;
    }
    const canReorderSources = currentNode && fromImg.nodeId && toImg.nodeId;
    const a = nodes.find(n => n.id === fromImg.nodeId);
    const b = nodes.find(n => n.id === toImg.nodeId);
    if(!canReorderSources || !a || !b) return;
    pushUndo();
    if(reorderInputSourceNodes(currentNode, fromImg.nodeId, toImg.nodeId, placement)){
        render();
        scheduleSave();
        return;
    }
    // Cross-node fallback: swap X positions of source nodes
    const ax = a.x, ay = a.y;
    a.x = b.x; a.y = b.y;
    b.x = ax; b.y = ay;
    render();
    scheduleSave();
}
function isSupportedUploadFile(file){
    const type = String(file?.type || '').toLowerCase();
    const name = String(file?.name || '').toLowerCase();
    return type.startsWith('image/') || type.startsWith('video/') || type.startsWith('audio/')
        || /\.(png|jpe?g|webp|gif|mp4|webm|mov|m4v|mp3|wav|m4a|aac|ogg|flac)(\?|$)/.test(name);
}
function dataTransferItemEntry(item){
    try { return item?.webkitGetAsEntry?.() || null; } catch { return null; }
}
async function filesFromEntry(entry){
    if(!entry) return [];
    if(entry.isFile){
        return new Promise(resolve => entry.file(file => resolve(file ? [file] : []), () => resolve([])));
    }
    if(!entry.isDirectory) return [];
    const reader = entry.createReader();
    const children = [];
    while(true){
        const batch = await new Promise(resolve => reader.readEntries(resolve, () => resolve([])));
        if(!batch.length) break;
        children.push(...batch);
    }
    const nested = await Promise.all(children.map(filesFromEntry));
    return nested.flat();
}
async function uploadFilesFromDataTransfer(dataTransfer){
    const items = [...(dataTransfer?.items || [])];
    const entries = items.map(dataTransferItemEntry).filter(Boolean);
    const raw = entries.length
        ? (await Promise.all(entries.map(filesFromEntry))).flat()
        : [...(dataTransfer?.files || [])];
    return raw.filter(isSupportedUploadFile);
}
function uploadTitleForItems(items, fallback='Upload'){
    const list = [...(items || [])];
    if(!list.length) return fallback;
    const kinds = new Set(list.map(item => item instanceof File ? mediaKindForFile(item) : mediaKindForItem(item)));
    if(kinds.size > 1) return list.length > 1 ? 'Media' : fallback;
    if(kinds.has('video')) return list.length > 1 ? 'Videos' : 'Video';
    if(kinds.has('audio')) return 'Audio';
    return list.length > 1 ? 'Group' : 'Image';
}
const SMART_IMAGE_DROP_EXT_RE = /\.(png|jpe?g|webp|gif)$/i;
const SMART_IMAGE_DROP_TEXT_TYPES = [
    'text/uri-list',
    'text/plain',
    'text/html',
    'DownloadURL',
    'text/x-moz-url',
    'text/x-file-url',
    'public.file-url',
    'public.url',
    'UniformResourceLocator',
    'FileName',
    'FileNameW'
];
const SMART_IMAGE_DROP_TYPE_HINT_RE = /^(?:files?|image\/.+|text\/(?:uri-list|html|plain|x-moz-url|x-file-url)|downloadurl|public\.(?:file-url|url)|uniformresourcelocator|filenamew?)$|application\/x-qt-(?:windows-mime|image)|application\/x-moz-file|com\.eagle/i;
function smartImageFilesFromDataTransfer(dataTransfer){
    return [...(dataTransfer?.files || [])].filter(isSupportedUploadFile);
}
async function smartResponseErrorMessage(response, fallback='请求失败'){
    try {
        const data = await response.clone().json();
        const detail = data.detail ?? data.error ?? data.message;
        if(typeof detail === 'string') return detail || fallback;
        if(Array.isArray(detail)) return detail.map(item => item?.msg || item?.message || String(item)).join('\n') || fallback;
    } catch(_) {}
    try {
        const text = await response.text();
        if(text) return text;
    } catch(_) {}
    return fallback;
}
function smartDropDataTypes(dataTransfer){
    return [...(dataTransfer?.types || [])].map(type => String(type || ''));
}
function readSmartDropData(dataTransfer, type){
    try { return dataTransfer?.getData?.(type) || ''; } catch(_) { return ''; }
}
function decodeSmartDropText(value){
    const text = String(value || '').trim();
    if(!text) return '';
    try { return decodeURIComponent(text); } catch(_) { return text; }
}
function smartDropTextFragments(value){
    const text = String(value || '').trim();
    if(!text) return [];
    const fragments = [];
    if(/<img|<a\s/i.test(text)){
        const doc = new DOMParser().parseFromString(text, 'text/html');
        doc.querySelectorAll('img[src],a[href]').forEach(el => fragments.push(el.getAttribute('src') || el.getAttribute('href') || ''));
    }
    text.split(/\r?\n/).forEach(line => {
        const item = line.trim();
        if(item) fragments.push(item);
    });
    const downloadUrl = text.match(/^image\/[^\s:]+:(.+)$/i);
    if(downloadUrl) fragments.push(downloadUrl[1]);
    return fragments;
}
function uniqueSmartDropValues(values){
    const seen = new Set();
    return values.filter(value => {
        const key = String(value || '').trim();
        if(!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
function smartDropTextCandidates(dataTransfer){
    if(!dataTransfer) return [];
    const types = uniqueSmartDropValues([...SMART_IMAGE_DROP_TEXT_TYPES, ...smartDropDataTypes(dataTransfer)]);
    const values = types.map(type => readSmartDropData(dataTransfer, type)).filter(Boolean);
    return uniqueSmartDropValues(values.flatMap(smartDropTextFragments).map(decodeSmartDropText))
        .filter(s => s && !s.startsWith('#'));
}
function isRemoteSmartImageDropValue(value){
    const text = String(value || '').trim();
    return /^https?:\/\/.+/i.test(text) || /^data:image\//i.test(text) || /^blob:/i.test(text);
}
function isLocalSmartImageDropValue(value){
    const text = String(value || '').trim();
    if(!text) return false;
    let path = text;
    if(/^file:/i.test(path)){
        try {
            const url = new URL(path);
            if(url.protocol !== 'file:') return false;
            path = decodeURIComponent(url.pathname || path);
        } catch(_) {
            return false;
        }
    }
    if(/^\/[a-zA-Z]:[\\/]/.test(path)) path = path.slice(1);
    const clean = path.split(/[?#]/, 1)[0];
    const isWindowsPath = /^[a-zA-Z]:[\\/]/.test(clean);
    const isPosixPath = clean.startsWith('/');
    return (isWindowsPath || isPosixPath) && SMART_IMAGE_DROP_EXT_RE.test(clean);
}
function smartLocalImagePathsFromDataTransfer(dataTransfer){
    return uniqueSmartDropValues(smartDropTextCandidates(dataTransfer).filter(isLocalSmartImageDropValue));
}
function smartImageNameFromUrl(url){
    try {
        const clean = String(url || '').split('?', 1)[0].split('#', 1)[0];
        return decodeURIComponent(clean.split('/').pop() || 'image');
    } catch(_) {
        return 'image';
    }
}
function smartImageDropPayload(dataTransfer){
    const files = smartImageFilesFromDataTransfer(dataTransfer);
    if(files.length) return {type:'files', files};
    const localPaths = smartLocalImagePathsFromDataTransfer(dataTransfer);
    if(localPaths.length) return {type:'localPaths', localPaths};
    const url = smartDropTextCandidates(dataTransfer).find(isRemoteSmartImageDropValue) || '';
    if(url) return {type:'url', url};
    return {type:'none'};
}
async function resolveSmartImageDropPayload(dataTransfer){
    const payload = smartImageDropPayload(dataTransfer);
    if(payload.type !== 'none') return payload;
    const files = await uploadFilesFromDataTransfer(dataTransfer);
    return files.length ? {type:'files', files} : payload;
}
function hasSmartImageDropData(dataTransfer){
    if(!dataTransfer) return false;
    if(smartImageFilesFromDataTransfer(dataTransfer).length) return true;
    const types = smartDropDataTypes(dataTransfer);
    if(types.some(type => SMART_IMAGE_DROP_TYPE_HINT_RE.test(type.toLowerCase()))) return true;
    return smartImageDropPayload(dataTransfer).type !== 'none';
}
function hasSmartAssetDrag(dataTransfer){
    return smartDropDataTypes(dataTransfer).includes('application/x-smart-asset');
}
function hasMediaDrawerDrag(dataTransfer){
    return smartDropDataTypes(dataTransfer).includes('application/x-smart-asset');
}
function hasSmartInputThumbDrag(dataTransfer){
    return smartDropDataTypes(dataTransfer).includes('application/x-smart-input-thumb');
}
function setSmartDropCopyEffect(e, includeAsset=false){
    e.preventDefault();
    if(hasSmartInputThumbDrag(e.dataTransfer)) return;
    if(hasSmartImageDropData(e.dataTransfer) || (includeAsset && hasSmartAssetDrag(e.dataTransfer))){
        e.dataTransfer.dropEffect = 'copy';
    }
}
async function uploadFiles(files){
    const supported = [...(files || [])].filter(isSupportedUploadFile).slice(0, SMART_UPLOAD_MAX);
    if(!supported.length) return [];
    const form = new FormData();
    supported.forEach(file => form.append('files', file, file.name || 'media'));
    const data = await fetch('/api/ai/upload', {method:'POST', body:form}).then(async r => {
        if(!r.ok) throw new Error((await r.text()) || tr('smart.toastUploadFail'));
        return r.json();
    });
    return (data.files || []).map((file, index) => ({
        ...file,
        kind:file.kind || mediaKindForFile(supported[index])
    }));
}
function appendImagesToSmartNode(uploaded, targetId='', opts={}){
    const images = [...(uploaded || [])].filter(file => file?.url);
    if(!images.length) return null;
    const targetGroup = nodes.find(n => n.id === targetId && isSmartGroupNode(n));
    let node = targetGroup ? null : (nodes.find(n => n.id === targetId) || selectedNode());
    if(node && !isSmartImageNode(node)) node = null;
    if(opts.forceNew) node = null;
    if(!node){
        const groupRect = targetGroup ? nodeRect(targetGroup) : null;
        const center = opts.point || (groupRect ? {x:groupRect.x + groupRect.width / 2, y:groupRect.y + groupRect.height / 2} : viewportCenter());
        undoSuppressed = true;
        node = createImageNodeAt(center, []);
        undoSuppressed = false;
    }
    const previousCount = (node.images || []).length;
    node.images = [...(node.images || []), ...images.map(file => ({...file, kind:file.kind || mediaKindForItem(file)}))];
    if(node.images.length > 1){
        node.title = uploadTitleForItems(node.images, 'Group');
        if(previousCount <= 1 && (!Number.isFinite(Number(node.scale)) || Number(node.scale) === MEDIA_NODE_DEFAULT_SCALE || Number(node.scale) === MEDIA_GROUP_PREVIOUS_DEFAULT_SCALE)){
            node.scale = MEDIA_GROUP_DEFAULT_SCALE;
        }
        delete node.w;
        delete node.h;
    }
    if(node.images.length === 1){ node.title = uploadTitleForItems(node.images, node.title || 'Image'); delete node.w; delete node.h; }
    if(targetGroup) addNodeToSmartGroup(targetGroup, node);
    selectedId = node.id;
    render();
    scheduleSave();
    return node;
}
async function handleFiles(files, targetId='', opts={}){
    try {
        const fileList = [...(files || [])].filter(isSupportedUploadFile).slice(0, SMART_UPLOAD_MAX);
        if(!fileList.length) return;
        const uploaded = await uploadFiles(fileList);
        if(!uploaded.length) return;
        if(!opts.skipUndo) pushUndo();
        appendImagesToSmartNode(uploaded.map((file, index) => ({...file, kind:file.kind || mediaKindForFile(fileList[index])})), targetId, opts);
    } catch(e) { toast(e.message || tr('smart.toastUploadFail')); }
}
async function importSmartLocalImages(paths){
    if(!paths?.length) return [];
    const response = await fetch('/api/ai/import-local-image', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({paths:(paths || []).slice(0, SMART_UPLOAD_MAX)})
    });
    if(!response.ok) throw new Error(await smartResponseErrorMessage(response, tr('smart.toastUploadFail')));
    const data = await response.json();
    return data.files || [];
}
async function handleSmartImageDropPayload(payload, targetId='', opts={}){
    try {
        if(payload.type === 'files') await handleFiles(payload.files, targetId, opts);
        else if(payload.type === 'localPaths') {
            if(!opts.skipUndo) pushUndo();
            appendImagesToSmartNode(await importSmartLocalImages(payload.localPaths), targetId, opts);
        } else if(payload.type === 'url') {
            if(!opts.skipUndo) pushUndo();
            appendImagesToSmartNode([{url:payload.url, name:smartImageNameFromUrl(payload.url), kind:'image'}], targetId, opts);
        }
    } catch(e) {
        toast(e.message || tr('smart.toastUploadFail'));
    }
}
function sizeForRun(sourceSettings=settings){
    const fallbackResolution = sourceSettings.engine === 'api' && isGptImageAutoSizeModel(sourceSettings.model)
        ? 'auto'
        : '1k';
    return apiImageSize(sourceSettings.ratio || 'square', sourceSettings.resolution || fallbackResolution, sourceSettings.customRatio || '', sourceSettings.customSize || '') || '1024x1024';
}
function outputCanvasRatioText(sourceSettings=settings, parsed=null){
    const ratioMap = {square:'1:1', portrait:'2:3', landscape:'3:2', portrait43:'3:4', landscape43:'4:3', story:'9:16', wide:'16:9', ultrawide:'21:9', ultratall:'9:21'};
    const key = sourceSettings?.ratio || 'square';
    if(key === 'custom' && sourceSettings?.customRatio) return String(sourceSettings.customRatio);
    if(ratioMap[key]) return ratioMap[key];
    const size = parsed || parseSizePair(sizeForRun(sourceSettings));
    if(size?.width > 0 && size?.height > 0){
        const d = gcdInt(size.width, size.height);
        return `${Math.round(size.width / d)}:${Math.round(size.height / d)}`;
    }
    return 'selected';
}
function outputCanvasLockPrompt(sourceSettings=settings){
    const size = sizeForRun(sourceSettings);
    const parsed = parseSizePair(size);
    if(!parsed || !(parsed.width > 0 && parsed.height > 0)) return '';
    const ratioText = outputCanvasRatioText(sourceSettings, parsed);
    return [
        'OUTPUT CANVAS LOCK:',
        `Generate the final image on a ${parsed.width}x${parsed.height}px canvas (${ratioText} aspect ratio).`,
        'This selected output canvas size and aspect ratio overrides every reference image aspect ratio, crop, poster layout, and old instruction that says to preserve the reference aspect ratio.',
        'Do not copy the reference image canvas shape; adapt the scene, crop, negative space, pose, and object placement to fit the selected output canvas while preserving strict product truth.'
    ].join('\n');
}
function expectedOutputSize(){
    const sizeStr = settings.engine === 'modelscope'
        ? apiImageSize(settings.msRatio || 'square', settings.msResolution || '1k', settings.msCustomRatio || '', settings.msCustomSize || '')
        : sizeForRun();
    const parsed = parseSizeValue(sizeStr);
    if(parsed){
        return {w: Number(parsed.width) || 1024, h: Number(parsed.height) || 1024};
    }
    return {w:1024, h:1024};
}
function explicitRequestOutputSizeForPending(){
    if(isApiLikeEngine(settings.engine) && settings.apiKind !== 'video'){
        const parsed = parseSizeValue(sizeForRun());
        if(parsed) return {w:Number(parsed.width) || 1024, h:Number(parsed.height) || 1024};
    }
    if(settings.engine === 'modelscope'){
        const sizeStr = apiImageSize(settings.msRatio || 'square', settings.msResolution || '1k', settings.msCustomRatio || '', settings.msCustomSize || '');
        const parsed = parseSizeValue(sizeStr);
        if(parsed) return {w:Number(parsed.width) || 1024, h:Number(parsed.height) || 1024};
    }
    return null;
}
function pendingSizeFromImageRef(img){
    const w = Number(img?.natural_w || img?.width || 0);
    const h = Number(img?.natural_h || img?.height || 0);
    return w > 0 && h > 0 ? {w, h} : null;
}
function pendingSourceBoxSize(options={}){
    const sourceNode = options.sourceNode || null;
    if(sourceNode && (sourceNode.images || []).length){
        const rect = nodeRect(sourceNode);
        if(rect.width > 24 && rect.height > 24) return {w:Math.round(rect.width), h:Math.round(rect.height), display:true};
    }
    const ref = (options.refs || []).find(img => img?.url);
    const refSize = pendingSizeFromImageRef(ref);
    if(refSize) return refSize;
    const refNode = ref?.nodeId ? nodes.find(n => n.id === ref.nodeId) : null;
    if(refNode){
        const rect = nodeRect(refNode);
        if(rect.width > 24 && rect.height > 24) return {w:Math.round(rect.width), h:Math.round(rect.height), display:true};
    }
    return null;
}
function displayBoxFromNaturalSize(size){
    const layout = singleImageLayout(
        {natural_w:size?.w || size?.width || 1024, natural_h:size?.h || size?.height || 1024},
        {type:'smart-image', images:[{}]},
        MEDIA_NODE_DEFAULT_SCALE
    );
    return {w:layout.width, h:layout.height};
}
function pendingBaseBoxSize(options={}){
    const requestSize = explicitRequestOutputSizeForPending();
    if(requestSize) return displayBoxFromNaturalSize(requestSize);
    const sourceSize = pendingSourceBoxSize(options);
    if(sourceSize?.display) return {w:sourceSize.w, h:sourceSize.h};
    if(sourceSize) return displayBoxFromNaturalSize(sourceSize);
    return displayBoxFromNaturalSize(expectedOutputSize());
}
function pendingBoxSize(count, options={}){
    const base = pendingBaseBoxSize(options);
    const aspect = base.w / Math.max(1, base.h);
    const c = Math.max(1, Number(count) || 1);
    if(c <= 1){
        return {w:Math.round(base.w), h:Math.round(base.h)};
    }
    const cols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(c))));
    const rows = Math.ceil(c / cols);
    const cellMax = Math.max(96, Math.min(220, Math.max(base.w, base.h) * 0.42));
    let cellW, cellH;
    if(base.w >= base.h){
        cellW = cellMax;
        cellH = Math.max(40 * MEDIA_NODE_DEFAULT_SCALE, Math.round(cellMax / aspect));
    } else {
        cellH = cellMax;
        cellW = Math.max(40 * MEDIA_NODE_DEFAULT_SCALE, Math.round(cellMax * aspect));
    }
    const w = cols * (cellW + 8) + 16;
    const h = rows * (cellH + 8) + 16;
    return {w, h};
}
function mentionTokenHtml(img){
    if(!img?.url) return '';
    const kind = mediaKindForItem(img);
    const name = img.alias || img.name || (kind === 'audio' ? '音频' : kind === 'video' ? '视频' : '图片');
    const media = mentionTokenMediaHtml(img, kind);
    return `<span class="mention-image-token" contenteditable="false" data-url="${escapeHtml(img.url)}" data-kind="${escapeHtml(kind)}" data-name="${escapeHtml(name)}" data-node-id="${escapeHtml(img.nodeId || '')}" data-image-index="${escapeHtml(img.imageIndex ?? '')}">${media}<span>${escapeHtml(name)}</span></span>`;
}
function mentionTokenMediaHtml(img, kind=mediaKindForItem(img)){
    if(kind === 'audio'){
        return `<div class="mention-audio-thumb"><i data-lucide="file-audio"></i></div>`;
    }
    if(kind === 'video'){
        return smartVideoPreviewHtml(img, 256, 'alt=""');
    }
    return smartPreviewImgHtml(img, 256, 'alt=""');
}
function mentionOptionMediaHtml(img){
    const kind = mediaKindForItem(img);
    if(kind === 'audio'){
        return `<div class="media-thumb audio-thumb mention-option-audio"><i data-lucide="file-audio"></i><span>${escapeHtml(img.alias || img.name || 'Audio')}</span></div>`;
    }
    return kind === 'video' ? smartVideoPreviewHtml(img, 256, 'alt=""') : smartPreviewImgHtml(img, 256, 'alt=""');
}
function promptHtmlWithMentionTokens(text, refs=[]){
    const value = String(text || '');
    const items = (refs || []).filter(ref => ref?.url && ref?.name).sort((a, b) => String(b.name || '').length - String(a.name || '').length);
    if(!value || !items.length || !value.includes('@')) return '';
    let html = '';
    let index = 0;
    while(index < value.length){
        if(value[index] === '@'){
            const hit = items.find(ref => value.slice(index + 1, index + 1 + String(ref.name || '').length) === String(ref.name || ''));
            if(hit){
                html += mentionTokenHtml(hit);
                index += 1 + String(hit.name || '').length;
                continue;
            }
        }
        html += escapeHtml(value[index]);
        index += 1;
    }
    return html;
}
function snapshotRunMeta(prompt, sourceId, displayPrompt='', refs=[], trace=null){
    return {
        prompt,
        displayPrompt:displayPrompt || promptPlainText() || prompt,
        promptHtml: promptInput ? promptInput.innerHTML : '',
        promptText: promptPlainText(),
        promptRefs:(refs || []).map(ref => ({url:ref.url || '', name:ref.name || '', nodeId:ref.nodeId || '', imageIndex:ref.imageIndex ?? ''})).filter(ref => ref.url),
        inputRefs:(refs || []).map(ref => ({url:ref.url || '', name:ref.name || '', nodeId:ref.nodeId || '', imageIndex:ref.imageIndex ?? '', kind:ref.kind || ''})).filter(ref => ref.url),
        sourceNodeId:sourceId,
        settings:JSON.parse(JSON.stringify(settings)),
        trace:trace || null,
        createdAt:Date.now()
    };
}
function attachRunMeta(targetNode, meta){
    if(!targetNode || !meta) return;
    targetNode.runPrompt = meta.displayPrompt || meta.promptText || meta.prompt;
    targetNode.runModelPrompt = meta.prompt;
    targetNode.runPromptRefs = meta.promptRefs || [];
    targetNode.runInputRefs = (meta.inputRefs || meta.promptRefs || []).map(ref => ({
        url:ref.url || '',
        name:ref.name || '',
        nodeId:ref.nodeId || '',
        imageIndex:ref.imageIndex ?? '',
        kind:ref.kind || ''
    })).filter(ref => ref.url);
    targetNode.runSettings = meta.settings;
    if(meta.trace) targetNode.runTrace = meta.trace;
    else delete targetNode.runTrace;
    if(meta.sourceNodeId && meta.sourceNodeId !== targetNode.id) targetNode.sourceNodeId = meta.sourceNodeId;
    else delete targetNode.sourceNodeId;
    targetNode.runAt = meta.createdAt;
    // 保存可编辑的 @-提及表单到草稿字段，方便点输出节点时还原原始可编辑形式
    if(meta.promptHtml != null){
        const htmlHasToken = String(meta.promptHtml || '').includes('mention-image-token');
        const rebuiltHtml = htmlHasToken ? '' : promptHtmlWithMentionTokens(meta.displayPrompt || meta.promptText || '', meta.promptRefs || []);
        targetNode.promptDraftHtml = htmlHasToken ? meta.promptHtml : (rebuiltHtml || meta.promptHtml);
        targetNode.promptDraftText = meta.promptText || '';
    }
    targetNode.images = (targetNode.images || []).map(img => stripImageGenerationMeta(img));
}
function stripRunInputMeta(meta){
    if(!meta) return meta;
    const cleanPrompt = meta.promptText || meta.displayPrompt || meta.prompt || '';
    return {
        ...meta,
        promptHtml:escapeHtml(cleanPrompt),
        promptText:cleanPrompt,
        promptRefs:[],
        inputRefs:meta.inputRefs || meta.promptRefs || [],
        sourceNodeId:''
    };
}
function stripImageGenerationMeta(img){
    if(!img) return img;
    delete img.runPrompt;
    delete img.runModelPrompt;
    delete img.runSettings;
    delete img.sourceNodeId;
    delete img.runAt;
    delete img.promptDraftHtml;
    delete img.promptDraftText;
    return img;
}
function addConnection(fromId, toId, kind='flow'){
    if(!fromId || !toId || fromId === toId) return;
    canvas.connections = canvas.connections || [];
    if(canvas.connections.some(c => c.from === fromId && c.to === toId && (c.kind || 'flow') === kind)) return;
    canvas.connections.push({from:fromId, to:toId, kind});
}
function connectInputNode(fromId, toId){
    const from = nodes.find(n => n.id === fromId);
    const to = nodes.find(n => n.id === toId);
    if(!from || !to || from.id === to.id) return false;
    if(to.type === 'smart-loop'){
        const looksImage = isSmartImageNode(from) || isSmartGroupNode(from) || (from.type === 'smart-loop' && from.imageInput);
        const looksPrompt = from.type === 'smart-prompt' || isSmartGroupNode(from) || (from.type === 'smart-loop' && from.showPrompt);
        if(looksImage && !to.imageInput) to.imageInput = true;
        if(looksPrompt && !to.showPrompt) to.showPrompt = true;
        if(looksImage || looksPrompt) fitSmartLoopNode(to);
        const canImage = Boolean(to.imageInput) && looksImage;
        const canPrompt = Boolean(to.showPrompt) && looksPrompt;
        if(!canImage && !canPrompt) return false;
    }
    to.inputNodeIds = Array.from(new Set([...(to.inputNodeIds || []), from.id]));
    addConnection(from.id, to.id, 'input');
    return true;
}
function upstreamNodesForKinds(node, kinds=['input']){
    if(!node) return [];
    const allowed = new Set(kinds);
    const ids = new Set();
    (canvas?.connections || []).forEach(conn => {
        if(conn.to === node.id && allowed.has(conn.kind || 'flow')) ids.add(conn.from);
    });
    if(!canvasUsesConnections && allowed.has('input')){
        (node.inputNodeIds || []).forEach(id => ids.add(id));
    }
    return [...ids].map(id => nodes.find(n => n.id === id)).filter(Boolean);
}
function inputNodesFor(node){
    return upstreamNodesForKinds(node, ['input']);
}
function workflowInputNodesFor(node){
    return upstreamNodesForKinds(node, ['input', 'flow']);
}
function clearDetachedRunInputRefs(node){
    if(!node) return;
    const hasUpstream = Boolean((canvas?.connections || []).some(conn => conn.to === node.id && ['input','flow'].includes(conn.kind || 'flow')));
    if(hasUpstream || (!canvasUsesConnections && Array.isArray(node.inputNodeIds) && node.inputNodeIds.some(id => nodes.some(n => n.id === id)))) return;
    delete node.runInputRefs;
    delete node.runPromptRefs;
    delete node.sourceNodeId;
}
function cleanupDetachedRunInputRefs(){
    if(!canvasUsesConnections) return false;
    let changed = false;
    nodes.forEach(node => {
        const hadRefs = Array.isArray(node?.runInputRefs) && node.runInputRefs.length;
        const hadPromptRefs = Array.isArray(node?.runPromptRefs) && node.runPromptRefs.length;
        const hadSource = Boolean(node?.sourceNodeId);
        clearDetachedRunInputRefs(node);
        if(hadRefs !== (Array.isArray(node?.runInputRefs) && node.runInputRefs.length)
            || hadPromptRefs !== (Array.isArray(node?.runPromptRefs) && node.runPromptRefs.length)
            || hadSource !== Boolean(node?.sourceNodeId)){
            changed = true;
        }
    });
    return changed;
}
function imagesForNode(node){
    if(isSmartGroupNode(node)){
        return smartGroupImageRefs(node).map((ref, index) => ({
            ...ref.item,
            nodeId:ref.nodeId,
            imageIndex:ref.index,
            groupNodeId:node.id,
            groupImageIndex:index
        }));
    }
    return (node?.images || []).map((img, index) => ({...imageForDisplay(img), nodeId:node.id, imageIndex:index}));
}
function nodeHasReferenceContent(node){
    return imagesForNode(node).some(img => img?.url);
}
function isSelfReferenceForNode(node, img){
    return Boolean(node?.id && img?.nodeId === node.id);
}
function candidateInputImagesFor(node, consume=false, ctx=smartLoopContext){
    const inputs = (smartImageUsesWorkflowInput(node, ctx) ? workflowInputImagesFor(node, consume, ctx) : inputImagesFor(node, consume, ctx))
        .filter(img => img?.url);
    if(!inputs.length) return [];
    if(smartImageUsesWorkflowInput(node, ctx)) return inputs;
    if(nodeHasReferenceContent(node)) return [];
    return inputs;
}
function defaultInputImagesFor(node, consume=false, ctx=smartLoopContext){
    return candidateInputImagesFor(node, consume, ctx);
}
function splitSmartPromptItems(text){
    const trimmed = String(text || '').trim();
    if(!trimmed) return [];
    const numbered = trimmed.split(/\s*(?:^|\s)\d+\s*[.、)）．]\s+/).map(s => s.trim()).filter(Boolean);
    if(numbered.length >= 2) return numbered;
    const lines = trimmed.split(/\r?\n+/).map(s => s.trim()).filter(Boolean);
    return lines.length >= 2 ? lines : [trimmed];
}
function smartLoopPromptFieldValues(node){
    const fields = Array.isArray(node?.variablePrompts)
        ? node.variablePrompts.map(text => String(text || '').trim())
        : [];
    if(fields.length) return fields;
    return splitSmartPromptItems(node?.variablePrompt || '');
}
function smartLoopActivePromptFieldValues(node){
    return smartLoopPromptFieldValues(node).filter(Boolean);
}
function setSmartLoopPromptFieldValues(node, values){
    if(!node || node.type !== 'smart-loop') return;
    const fields = (values || []).map(text => String(text || '').trim());
    node.variablePrompts = fields.length ? fields : [''];
    node.variablePrompt = fields.filter(Boolean).join('\n');
}
function smartLoopPromptFieldText(node, fieldIndex){
    const values = smartLoopPromptFieldValues(node);
    return values[fieldIndex] || '';
}
function smartLoopSelectedLocalPrompt(node, ctx=smartLoopContext){
    const values = smartLoopActivePromptFieldValues(node);
    if(!values.length) return '';
    const startBase = Math.max(1, Number(node?.loopStart) || 1);
    const index = Math.max(1, Number(ctx?.index || startBase) || startBase);
    return values[(index - 1) % values.length] || '';
}
function smartLoopUpstreamPromptPreviewHeight(node){
    return smartLoopInputPromptItems(node).length ? 78 : 0;
}
const smartLoopPromptVisiting = new Set();
function smartLoopInputPromptItems(node){
    if(!node?.showPrompt || smartLoopPromptVisiting.has(node.id)) return [];
    smartLoopPromptVisiting.add(node.id);
    try {
        return inputNodesFor(node).flatMap(input => {
            if(input.type === 'smart-prompt') return promptNodePromptItems(input);
            if(input.type === 'smart-loop') {
                const text = smartLoopPrompt(input);
                return text ? [text] : [];
            }
            return [];
        }).filter(Boolean);
    } finally {
        smartLoopPromptVisiting.delete(node.id);
    }
}
function smartLoopSelectedInputPrompt(node, ctx=smartLoopContext){
    const items = smartLoopInputPromptItems(node);
    if(!items.length) return '';
    const startBase = Math.max(1, Number(node?.loopStart) || 1);
    const index = Math.max(1, Number(ctx?.index || startBase) || startBase);
    return items[(index - 1) % items.length] || '';
}
function smartLoopPrompt(node, ctx=smartLoopContext){
    if(!node?.showPrompt) return '';
    const count = smartLoopCount(node);
    const startBase = Math.max(1, Number(node.loopStart) || 1);
    const index = Math.max(1, Number(ctx?.index || startBase) || startBase);
    const total = Math.max(1, Number(ctx?.total || count) || count);
    const selected = smartLoopSelectedInputPrompt(node, ctx);
    const localPrompt = smartLoopSelectedLocalPrompt(node, ctx);
    const combined = [selected, localPrompt].map(text => String(text || '').trim()).filter(Boolean).join('\n\n');
    return String(combined || '')
        .replaceAll('《计数》', String(index))
        .replaceAll('[计数]', String(index))
        .replaceAll(`[${tr('canvas.counterToken')}]`, String(index))
        .replaceAll('《总数》', String(total))
        .replaceAll('[总数]', String(total))
        .replaceAll('《进度》', `${index}/${total}`)
        .replaceAll('[进度]', `${index}/${total}`)
        .trim();
}
function smartLoopInputImages(node, ctx=smartLoopContext){
    if(!node?.imageInput) return [];
    const refs = inputNodesFor(node).flatMap(input => {
        if(input?.type === 'smart-loop') return smartLoopInputImages(input, ctx);
        return imagesForNode(input);
    }).filter(img => img?.url);
    if(!refs.length) return [];
    const startBase = Math.max(1, Number(node.loopStart) || 1);
    const batchSize = Math.max(1, Math.min(100, Number(node.imageBatchSize) || 1));
    const currentIndex = Math.max(1, Number(ctx?.index || startBase) || startBase);
    return refs.slice(Math.max(0, currentIndex - 1), Math.max(0, currentIndex - 1) + batchSize)
        .map((img, i) => ({...img, name:img.name || trf('canvas.loopImageLabel', {n:currentIndex + i})}));
}
function smartLoopPreviewImages(node){
    if(!node?.imageInput) return [];
    return inputNodesFor(node).flatMap(input => {
        if(input?.type === 'smart-loop') return smartLoopInputImages(input, {index:Number(node.loopStart) || 1});
        return imagesForNode(input);
    }).filter(img => img?.url);
}
const smartPromptReferenceVisiting = new Set();
function promptNodeApplyCurrentReferenceRoles(node, refs=[]){
    const list = uniqueReferenceImages(refs);
    const imageCount = imageRefsOnly(list).length;
    const wantsProductTruth = smartNodeRequestsProductTruth(node);
    const splitStyleAndProductRefs = Boolean(node?.styleMatch) && wantsProductTruth && imageCount > 1;
    let imageIndex = 0;
    return list.map(ref => {
        if(!ref?.url || mediaKindForItem(ref) !== 'image') return ref;
        const currentImageIndex = imageIndex++;
        if(splitStyleAndProductRefs){
            if(currentImageIndex === 0){
                return {
                    ...ref,
                    role:'primary_style_reference',
                    productTruthExplicit:false,
                    referenceWeight:promptNodeReferenceWeight(node)
                };
            }
            return {
                ...ref,
                role:'product_detail_reference',
                styleLock:false,
                referenceLock:false,
                productTruthExplicit:true,
                referenceWeight:100,
                inputFidelity:'high'
            };
        }
        return ref;
    });
}
function promptNodeRawCurrentReferenceImages(node, consume=false, ctx=smartLoopContext){
    if(!node || node.type !== 'smart-prompt') return [];
    const upstream = inputNodesFor(node).flatMap(input => outputImagesForNode(input, consume, ctx)).filter(ref => ref?.url);
    return uniqueReferenceImages([...upstream, ...manualReferenceImagesFor(node)]);
}
function promptNodeCurrentReferenceImages(node, consume=false, ctx=smartLoopContext){
    return promptNodeApplyCurrentReferenceRoles(node, promptNodeRawCurrentReferenceImages(node, consume, ctx));
}
function smartPromptPassthroughImages(node, consume=false, ctx=smartLoopContext){
    if(!node || node.type !== 'smart-prompt' || smartPromptReferenceVisiting.has(node.id)) return [];
    smartPromptReferenceVisiting.add(node.id);
    try {
        const productTruthNode = smartNodeRequestsProductTruth(node);
        const splitStyleAndProductRefs = Boolean(node?.styleMatch) && productTruthNode;
        const upstream = inputNodesFor(node).flatMap(input => {
            const directImages = imagesForNode(input).filter(img => img?.url && mediaKindForItem(img) === 'image');
            const multiViewProduct = productTruthNode && directImages.length > 1;
            return outputImagesForNode(input, consume, ctx).map(ref => {
                if(splitStyleAndProductRefs || !multiViewProduct || mediaKindForItem(ref) !== 'image') return ref;
                return {...ref, role:'product_detail_reference', productTruthExplicit:true};
            });
        });
        return promptNodeApplyCurrentReferenceRoles(node, [...upstream, ...manualReferenceImagesFor(node)]);
    } finally {
        smartPromptReferenceVisiting.delete(node.id);
    }
}
function outputImagesForNode(node, consume=false, ctx=smartLoopContext){
    if(node?.type === 'smart-group') return imagesForNode(node).filter(img => img?.url);
    if(node?.type === 'smart-loop') return smartLoopInputImages(node, ctx);
    if(node?.type === 'smart-prompt') return smartPromptPassthroughImages(node, consume, ctx);
    if(isGeneratedImagePromptComposerNode(node) && node?.generatedPromptInitialized){
        return generatedImagePromptReferences(node).filter(img => img?.url);
    }
    const roundOutputs = ctx?.roundOutputs;
    if(node?.id && roundOutputs && typeof roundOutputs.get === 'function' && roundOutputs.has(node.id)){
        return (roundOutputs.get(node.id) || []).filter(img => img?.url);
    }
    return imagesForNode(node).filter(img => img?.url);
}
function selfReferenceImagesForNode(node, consume=false, ctx=smartLoopContext){
    return outputImagesForNode(node, consume, ctx).filter(img => img?.url);
}
function textForNode(node, ctx=smartLoopContext){
    if(!node) return '';
    if(node.type === 'smart-prompt') return promptNodePromptItems(node).join('\n\n');
    if(isGeneratedImagePromptComposerNode(node) && node?.generatedPromptInitialized) return promptNodePromptItems(node).join('\n\n');
    if(node.type === 'smart-loop') return smartLoopPrompt(node, ctx);
    if(node.type === 'smart-group') return smartGroupMembers(node).map(member => textForNode(member, ctx)).filter(Boolean).join('\n\n');
    return '';
}
function promptInputNodesFor(node){
    return inputNodesFor(node).filter(input =>
        input?.type === 'smart-prompt'
        || input?.type === 'smart-loop'
        || input?.type === 'smart-group'
        || (isGeneratedImagePromptComposerNode(input) && input?.generatedPromptInitialized)
    );
}
function smartPromptNodeIsProductTruthOnly(node){
    if(!node || node.type !== 'smart-prompt' || !smartNodeRequestsProductTruth(node)) return false;
    const upstreamImages = inputNodesFor(node).flatMap(input => imagesForNode(input)).filter(img => img?.url && mediaKindForItem(img) === 'image');
    const analysisText = [
        node?.styleMatch?.analysis?.summary,
        node?.styleMatch?.analysis?.reference_summary?.product_truth,
        node?.styleMatch?.analysis?.reference_summary?.style_reference,
        node?.styleMatch?.analysis?.style_fingerprint?.category
    ].map(value => String(value || '')).join(' ');
    if(/portrait|model|character|lifestyle|人像|人物|模特|生活方式|美妆广告|护肤广告/i.test(analysisText)) return false;
    if(upstreamImages.length > 1) return true;
    return upstreamImages.length > 0 && /isolated product|product render|product photography|e-commerce|commerce|电商|产品渲染|产品摄影|单品/i.test(analysisText);
}
function smartProductTruthOnlyPrompt(node){
    const analysis = node?.styleMatch?.analysis || {};
    const truth = String(analysis?.reference_summary?.product_truth || '').trim();
    const surface = String(analysis?.style_fingerprint?.material?.product_surface || '').trim();
    const packaging = String(analysis?.style_fingerprint?.material?.packaging_finish || '').trim();
    const summary = String(analysis?.summary || '').trim();
    return [
        'Product truth input (identity only; do not inherit this node’s background, camera, layout, or no-person instructions):',
        truth || summary,
        surface ? `Visible product surface/material: ${surface}` : '',
        packaging ? `Visible product construction/finish: ${packaging}` : '',
        'Use the attached multi-view images as one exact 3D SKU. Preserve silhouette, proportions, nozzle/opening, controls, transparent parts, accent rings, seams, and component placement.'
    ].filter(Boolean).join('\n');
}
function inputPromptTextFor(node, ctx=smartLoopContext){
    const directInputs = promptInputNodesFor(node);
    const hasStylePeer = directInputs.some(input => input?.type === 'smart-prompt' && !smartPromptNodeIsProductTruthOnly(input));
    const directText = directInputs.map(input => {
        if(hasStylePeer && smartPromptNodeIsProductTruthOnly(input)) return smartProductTruthOnlyPrompt(input);
        return textForNode(input, ctx);
    }).filter(Boolean);
    const relayText = Array.isArray(ctx?.relayPromptNodeIds)
        ? ctx.relayPromptNodeIds.map(id => nodes.find(n => n.id === id)).map(input => textForNode(input, ctx)).filter(Boolean)
        : [];
    const seen = new Set();
    return [...directText, ...relayText].filter(text => {
        const key = String(text || '').trim();
        if(!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    }).join('\n\n');
}
function upstreamLoopPromptNodesFor(node){
    return promptInputNodesFor(node).filter(input => input?.type === 'smart-loop' && input.showPrompt);
}
function inputImagesFor(node, consume=false, ctx=smartLoopContext){
    return inputNodesFor(node).flatMap(input => outputImagesForNode(input, consume, ctx));
}
function workflowInputImagesFor(node, consume=false, ctx=smartLoopContext){
    return workflowInputNodesFor(node).flatMap(input => outputImagesForNode(input, consume, ctx));
}
function rememberRoundOutputs(ctx, node, outputs){
    if(!ctx || !node?.id || !Array.isArray(outputs)) return outputs || [];
    if(!ctx.roundOutputs || typeof ctx.roundOutputs.set !== 'function') ctx.roundOutputs = new Map();
    ctx.roundOutputs.set(node.id, outputs.filter(img => img?.url).map(img => ({...img})));
    return outputs;
}
function inputRefKey(img){
    if(!img?.url) return '';
    const nodeId = img.nodeId || '';
    const imageIndex = Number.isFinite(Number(img.imageIndex)) ? String(Number(img.imageIndex)) : '';
    if(nodeId && imageIndex !== '') return `${nodeId}|${imageIndex}`;
    return `url|${img.url}`;
}
function blockedInputRefKeys(node){
    return new Set(Array.isArray(node?.blockedInputRefs) ? node.blockedInputRefs.filter(Boolean) : []);
}
function manualReferenceImagesFor(node){
    if(!node || !Array.isArray(node.manualInputRefs)) return [];
    return node.manualInputRefs.filter(img => img?.url).map((img, index) => ({
        ...img,
        kind:img.kind || mediaKindForItem(img),
        name:img.name || `图${index + 1}`,
        imageIndex:Number.isFinite(Number(img.imageIndex)) ? Number(img.imageIndex) : index,
        manualAdded:true
    }));
}
function isInputRefBlocked(node, img){
    if(!node || !img?.url) return false;
    return blockedInputRefKeys(node).has(inputRefKey(img));
}
function activeInputImagesFor(node, consume=false, ctx=smartLoopContext){
    return inputImagesFor(node, consume, ctx).filter(img => img?.url && !isInputRefBlocked(node, img));
}
function toggleInputRefBlocked(node, img){
    if(!node || !img?.url) return;
    const key = inputRefKey(img);
    if(!key) return;
    pushUndo();
    const blocked = blockedInputRefKeys(node);
    if(blocked.has(key)) blocked.delete(key);
    else blocked.add(key);
    node.blockedInputRefs = [...blocked];
    if(!node.blockedInputRefs.length) delete node.blockedInputRefs;
    renderInputThumbsRow(node);
    scheduleSave();
}
function defaultReferenceImagesFor(node, consume=false, ctx=smartLoopContext){
    if(!node) return [];
    const self = selfReferenceImagesForNode(node, consume, ctx).filter(img => img?.url).map(img => {
        if(!img?.generatedResult) return img;
        return {
            ...img,
            role:'composition_reference',
            styleLock:false,
            referenceLock:true,
            generatedEditBase:true,
            structureLock:true,
            referenceWeight:100,
            similarityIntent:'strict_edit_base_structure',
            inputFidelity:'high',
            uploadReference:true,
            textOnlyReference:false
        };
    });
    const upstream = (smartImageUsesWorkflowInput(node, ctx) ? workflowInputImagesFor(node, consume, ctx) : inputImagesFor(node, consume, ctx))
        .filter(img => img?.url);
    const directPromptStyles = inputNodesFor(node).filter(input => input?.type === 'smart-prompt' && !smartPromptNodeIsProductTruthOnly(input))
        .flatMap(input => manualReferenceImagesFor(input).filter(ref => ['composition_reference','primary_style_reference','primary_reference'].includes(ref?.role)));
    const manual = manualReferenceImagesFor(node);
    if(smartImageUsesWorkflowInput(node, ctx)) return uniqueReferenceImages([...upstream, ...directPromptStyles, ...manual]);
    if(self.length) return uniqueReferenceImages([...self, ...upstream, ...directPromptStyles, ...manual]);
    return uniqueReferenceImages([...upstream, ...directPromptStyles, ...manual]);
}
function lineConnectionsFor(node){
    if(!node) return [];
    return (canvas?.connections || []).filter(conn => {
        if(!conn?.from || !conn?.to || conn.from === conn.to) return false;
        return ['input', 'flow'].includes(conn.kind || 'flow');
    });
}
function connectedLineNodeIds(node){
    if(!node) return [];
    const conns = lineConnectionsFor(node);
    const upstream = [];
    const downstream = [];
    const seenUp = new Set([node.id]);
    const seenDown = new Set([node.id]);
    const walkUp = id => {
        conns.filter(conn => conn.to === id).forEach(conn => {
            if(seenUp.has(conn.from)) return;
            seenUp.add(conn.from);
            walkUp(conn.from);
            upstream.push(conn.from);
        });
    };
    const walkDown = id => {
        conns.filter(conn => conn.from === id).forEach(conn => {
            if(seenDown.has(conn.to)) return;
            seenDown.add(conn.to);
            downstream.push(conn.to);
            walkDown(conn.to);
        });
    };
    walkUp(node.id);
    walkDown(node.id);
    return [...upstream, node.id, ...downstream];
}
function upstreamLineNodeIds(node){
    if(!node) return [];
    const conns = lineConnectionsFor(node);
    const upstream = [];
    const seen = new Set([node.id]);
    const walk = id => {
        conns.filter(conn => conn.to === id).forEach(conn => {
            if(seen.has(conn.from)) return;
            seen.add(conn.from);
            walk(conn.from);
            upstream.push(conn.from);
        });
    };
    walk(node.id);
    return [...upstream, node.id];
}
function lineImagesFor(node){
    const ids = upstreamLineNodeIds(node);
    return ids.flatMap(id => {
        const source = nodes.find(n => n.id === id);
        return imagesForNode(source);
    }).filter(img => img?.url);
}
function collectMentionedImagesFromPrompt(){
    const images = [];
    collectPromptParts().forEach(part => {
        if(part.type === 'image' && part.url) images.push(part);
    });
    return images;
}
function uniqueReferenceImages(images){
    const refs = [];
    const seen = new Map();
    (images || []).forEach((img, index) => {
        if(!img?.url) return;
        if(seen.has(img.url)){
            const existingIndex = seen.get(img.url);
            const existing = refs[existingIndex];
            const existingRole = existing?.role || '';
            const incomingRole = img?.role || '';
            const role = smartReferenceRolePriority(incomingRole) > smartReferenceRolePriority(existingRole)
                ? incomingRole
                : existingRole;
            refs[existingIndex] = {
                ...img,
                ...existing,
                role:role || existingRole || incomingRole,
                styleLock:Boolean(existing?.styleLock || img?.styleLock),
                referenceLock:Boolean(existing?.referenceLock || img?.referenceLock),
                productTruthExplicit:Boolean(existing?.productTruthExplicit || img?.productTruthExplicit)
            };
            return;
        }
        if(refs.length >= SMART_REFERENCE_IMAGE_MAX) return;
        seen.set(img.url, refs.length);
        refs.push({
            ...img,
            name:img.name || `图${refs.length + 1}`,
            role:img.role || `image_${refs.length + 1}`,
            imageIndex:Number.isFinite(Number(img.imageIndex)) ? Number(img.imageIndex) : index
        });
    });
    return refs;
}
function smartReferenceRolePriority(role){
    const value = String(role || '');
    if(value === 'product_truth_reference' || value === 'product_detail_reference') return 100;
    if(value === 'composition_reference' || value === 'primary_style_reference' || value === 'primary_reference') return 80;
    if(value === 'supporting_reference') return 50;
    if(value === 'case_style_reference') return 10;
    return 20;
}
function smartReferenceUrlKey(url){
    return String(url || '').split('#')[0].trim();
}
function smartReferenceRoleIsCase(ref){
    return ref?.role === 'case_style_reference'
        || ref?.styleCaseWeak
        || /^Case style supplement:/i.test(String(ref?.name || ''));
}
function cleanupCaseStyleReferenceInputs(){
    let changed = false;
    (nodes || []).forEach(node => {
        ['manualInputRefs', 'runInputRefs', 'runPromptRefs'].forEach(key => {
            if(!Array.isArray(node?.[key])) return;
            const filtered = node[key].filter(ref => !smartReferenceRoleIsCase(ref));
            if(filtered.length === node[key].length) return;
            changed = true;
            if(filtered.length) node[key] = filtered;
            else delete node[key];
        });
    });
    return changed;
}
function smartReferenceUploadAllowed(ref){
    if(!ref?.url || ref?.textOnlyReference || ref?.uploadReference === false) return false;
    if(smartReferenceRoleIsCase(ref)) return false;
    return true;
}
function smartReferenceRoleIsPrimary(node, ref){
    const role = ref?.role || '';
    if(role === 'primary_style_reference' || role === 'primary_reference' || role === 'composition_reference') return true;
    if(ref?.styleLock || ref?.referenceLock) return true;
    const styleUrl = smartReferenceUrlKey(node?.styleMatch?.image || node?.styleMatch?.source || '');
    return Boolean(styleUrl && smartReferenceUrlKey(ref?.url) === styleUrl);
}
function smartReferenceHasProductHint(ref){
    const text = [
        ref?.role,
        ref?.name,
        ref?.categoryName,
        ref?.title,
        ref?.sourceName
    ].map(v => String(v || '').toLowerCase()).join(' ');
    return /product|truth|sku|pack|package|packaging|bottle|tube|jar|can|box|cosmetic|skincare|asset|\u4ea7\u54c1|\u5546\u54c1|\u7d20\u6750|\u5305\u88c5|\u74f6|\u7ba1|\u76d2|\u7f50|\u9762\u819c|\u62a4\u80a4|\u7f8e\u5986/.test(text);
}
function smartReferenceRoleIsProduct(ref){
    return ref?.role === 'product_truth_reference' || ref?.role === 'product_detail_reference' || smartReferenceHasProductHint(ref);
}
function smartFlattenTextValues(value, out=[], depth=0){
    if(value == null || depth > 5) return out;
    if(typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'){
        const text = String(value || '').trim();
        if(text) out.push(text);
        return out;
    }
    if(Array.isArray(value)){
        value.forEach(item => smartFlattenTextValues(item, out, depth + 1));
        return out;
    }
    if(typeof value === 'object'){
        Object.values(value).forEach(item => smartFlattenTextValues(item, out, depth + 1));
    }
    return out;
}
function smartHumanNegativePattern(){
    return /(?:no|without|exclude|remove|avoid|not include|do not include|do not add|do not generate)\s+(?:any\s+)?(?:person|people|human|model|face|hand|hands|finger|arm|body|limb|human body part)|(?:person|people|human|model|face|hand|hands|finger|arm|body|limb|human body part)[-\s]*free|product[-\s]*(?:only|solo)|object[-\s]*only|isolated product|still life|pure product|no-human|no human|不要(?:人物|人像|人|模特|手|手部|肢体|身体|脸|面部)|无(?:人物|人像|人|模特|手|手部|肢体|身体|脸|面部)|不(?:出现|需要|要|添加|生成)(?:人物|人像|人|模特|手|手部|肢体|身体|脸|面部)|纯产品|单品|产品单独|产品独立|静物|无人场景/i;
}
function smartHumanPositivePattern(){
    return /(?:^|[^a-z])(?:person|people|human|human model|model|woman|man|girl|boy|female|male|portrait|face|facial|hand|hands|finger|palm|arm|body|torso|shoulder|leg|limb|holding|hold|grip|wearing|consumer|lifestyle person)(?:[^a-z]|$)|人物|人像|真人|模特|女人|女性|男人|男性|女孩|男孩|消费者|生活方式人物|脸|面部|五官|手部|手指|掌心|手掌|手臂|胳膊|肢体|身体|肩膀|腿部|拿着|握着|托着|抓着|捧着|佩戴|穿着|手持产品|手拿|手里|手中/i;
}
function smartHumanInteractionPositivePattern(){
    return /(?:\u4eba\u7269|\u4eba\u50cf|\u771f\u4eba|\u6a21\u7279|\u5973\u6027|\u5973\u4eba|\u7537\u6027|\u7537\u4eba|\u8138\u90e8|\u624b\u90e8|\u80a2\u4f53|\u8eab\u4f53|\u817f|\u817f\u90e8|\u811a|\u53cc\u811a|\u4e24\u53ea\u811a|\u811a\u638c|\u811a\u8dbe|\u819d\u76d6|\u5750\u59ff|\u7ad9\u59ff|\u7a7f\u7740|\u624b\u6301|\u62ff\u7740|\u63e1\u7740|\u8e29|\u8e29\u5728|\u8e29\u8e0f|\u4f7f\u7528\u573a\u666f|\u4f7f\u7528\u6548\u679c|\u4e92\u52a8)|(?:\u4ea7\u54c1|\u5546\u54c1|\u673a\u5668|\u5668\u68b0|\u8e0f\u677f).{0,24}(?:\u4e92\u52a8|\u8e29|\u811a|\u817f|\u4f7f\u7528|\u63a5\u89e6)|(?:\u4eba|\u6a21\u7279|\u5973|\u7537).{0,24}(?:\u4ea7\u54c1|\u5546\u54c1|\u673a\u5668|\u5668\u68b0|\u8e0f\u677f|\u4e92\u52a8|\u8e29|\u811a|\u817f|\u4f7f\u7528)|\b(?:woman|man|person|people|human|model|female|male|leg|legs|foot|feet|barefoot|shoe|shoes|knee|knees|sitting|standing|wearing|holding|using|interacting|step(?:ping)?\s+on|feet\s+on)\b/i;
}
function smartStripHumanAntiCopyClauses(text){
    return String(text || '')
        .replace(/(?:do not|don't|never|avoid|ignore|without)\s+[^.\n;。；]*(?:person|people|human|model|face|hand|hands|finger|arm|body|limb|pose|skin|hair)[^.\n;。；]*[.\n;。；]?/gi, ' ')
        .replace(/(?:不要|避免|不得|不应|禁止|忽略)[^。\n；;]*(?:人物|人像|人|模特|脸|面部|手|手部|肢体|身体|姿势|皮肤|头发)[^。\n；;]*[。\n；;]?/g, ' ');
}
function smartTextExplicitlyForbidsHuman(text){
    const value = String(text || '');
    const cnNegative = /(?:\u4e0d\u8981|\u65e0|\u4e0d\u51fa\u73b0|\u7981\u6b62|\u53bb\u6389|\u6392\u9664|不要|无|不出现|禁止|去掉|排除).{0,12}(?:\u4eba\u7269|\u4eba\u50cf|\u771f\u4eba|\u6a21\u7279|\u4eba\u8138|\u8138|\u624b|\u624b\u90e8|\u80a2\u4f53|人物|人像|真人|模特|人脸|脸|手|手部|肢体)/i;
    return smartHumanNegativePattern().test(value) || cnNegative.test(value);
}
function smartTextExplicitlyRequestsHuman(text){
    const value = String(text || '');
    if(!value.trim()) return false;
    const stripped = smartStripHumanAntiCopyClauses(value);
    if(/(?:\u4eba\u7269|\u4eba\u50cf|\u771f\u4eba|\u6a21\u7279|\u4eba\u8138|\u8138\u90e8|\u624b\u90e8|\u624b\u6301|\u62ff\u7740|\u63e1\u7740|\u4f7f\u7528\u573a\u666f|\u4f7f\u7528\u6548\u679c|\u4e0a\u8138|\u62a4\u7406\u573a\u666f|人物|人像|真人|模特|人脸|脸部|手部|手持|拿着|握着|使用场景|使用效果|上脸|护理场景)/i.test(stripped)) return true;
    if(smartHumanInteractionPositivePattern().test(stripped)) return true;
    return smartHumanPositivePattern().test(stripped);
}
function smartPromptHighestPriorityRequestText(prompt=''){
    const text = String(prompt || '');
    const markers = [
        'Highest priority user modification request:',
        'Latest user modification request (highest priority):',
        'Latest user modification request:'
    ];
    const found = markers
        .map(marker => ({marker, start:text.indexOf(marker)}))
        .filter(item => item.start >= 0)
        .sort((a, b) => a.start - b.start)[0];
    if(!found) return '';
    const rest = text.slice(found.start + found.marker.length);
    const endMarkers = [
        '\nApply this latest user request',
        '\nThis is a high-priority constraint',
        '\nVariant plan:',
        '\nNegative prompt:',
        '\n\n'
    ];
    const ends = endMarkers.map(markerText => rest.indexOf(markerText)).filter(index => index >= 0);
    const end = ends.length ? Math.min(...ends) : rest.length;
    return rest.slice(0, end).trim();
}
function smartLatestUserRequestText(node, prompt='', seen=new Set()){
    if(!node?.id || seen.has(node.id)) return smartPromptHighestPriorityRequestText(prompt);
    seen.add(node.id);
    const directInstruction = String(node.llmInstruction || '').trim();
    const parts = [
        smartPromptHighestPriorityRequestText(prompt),
        directInstruction,
        directInstruction ? '' : node.promptDraftText
    ].map(value => String(value || '').trim()).filter(Boolean);
    inputNodesFor(node).forEach(input => {
        if(input?.type === 'smart-prompt' || input?.type === 'smart-loop' || isSmartGroupNode(input) || (isGeneratedImagePromptComposerNode(input) && input?.generatedPromptInitialized)){
            const nested = smartLatestUserRequestText(input, '', seen);
            if(nested) parts.push(nested);
        }
    });
    return parts.filter(Boolean).join('\n\n');
}
function smartLatestRequestChangesBackgroundPalette(node, prompt=''){
    const text = smartLatestUserRequestText(node, prompt);
    if(!text) return false;
    return /(?:背景|底色|配色|色调|颜色).{0,16}(?:改|换|变|调整|重新|不要|不再|去掉)|(?:改|换|变|调整|重新).{0,12}(?:背景|底色|配色|色调|颜色)|(?:background|backdrop|palette|colou?r\s*scheme).{0,24}(?:change|replace|switch|different|new)|(?:change|replace|switch).{0,24}(?:background|backdrop|palette|colou?r\s*scheme)/i.test(text);
}
function promptNodeLatestVisualOverridePrompt(node){
    if(!smartLatestRequestChangesBackgroundPalette(node)) return '';
    return [
        'LATEST BACKGROUND/PALETTE OVERRIDE:',
        'The latest user request explicitly changes the background and/or color palette.',
        'Do not preserve, restore, or visually inherit the reference image’s old background color, backdrop gradient, palette, wardrobe color coordination, or prop colors when they conflict with the latest request.',
        'Use the reference only for non-conflicting subject relationship, product-use logic, beauty-lighting quality, skin/material finish, and commercial polish. The newly requested background and palette are mandatory.'
    ].filter(Boolean).join(' ');
}
function smartNodeUserIntentText(node, seen=new Set()){
    if(!node?.id || seen.has(node.id)) return '';
    seen.add(node.id);
    const own = [
        node.text,
        node.promptDraftText,
        node.llmInstruction,
        node.llmSystemPrompt
    ].map(value => String(value || '')).filter(Boolean);
    if(node.type === 'smart-loop') own.push(smartLoopPrompt(node));
    if(isSmartGroupNode(node)){
        own.push(...smartGroupMembers(node).map(member => smartNodeUserIntentText(member, seen)).filter(Boolean));
    }
    inputNodesFor(node).forEach(input => {
        if(input?.type === 'smart-prompt' || input?.type === 'smart-loop' || isSmartGroupNode(input) || (isGeneratedImagePromptComposerNode(input) && input?.generatedPromptInitialized)){
            own.push(smartNodeUserIntentText(input, seen));
        }
    });
    return own.filter(Boolean).join('\n\n');
}
function smartStyleMatchValuesText(node){
    const analysis = node?.styleMatch?.analysis || {};
    return smartFlattenTextValues([
        node?.styleMatch?.query,
        node?.styleMatch?.title,
        analysis?.summary,
        analysis?.reference_summary,
        analysis?.style_fingerprint,
        analysis?.shared_style_anchor,
        analysis?.generation_guidance,
        analysis?.positive_prompt,
        analysis?.layout_lock_prompt,
        analysis?.lighting_material_lock_prompt
    ]).join(' ');
}
function smartStyleMatchLikelyContainsPerson(node){
    const text = smartStyleMatchValuesText(node);
    if(!text.trim() || smartTextExplicitlyForbidsHuman(text)) return false;
    return smartHumanPositivePattern().test(text);
}
function smartPromptExplicitlyRequestsHuman(node, prompt=''){
    return smartTextExplicitlyRequestsHuman([prompt, smartNodeUserIntentText(node)].filter(Boolean).join('\n\n'));
}
function smartRefsLikelyContainPerson(node, refs=[]){
    return imageRefsOnly(refs).some(ref => smartReferenceLikelyContainsPerson(node, ref));
}
function smartPromptLooksSystemGenerated(text=''){
    return /NO HUMAN SUBJECT LOCK:|UPLOADED IMAGE ROLE MAP:|Product truth references:|Product recognition summary from product reference images:|Reference priority:|Original reference similarity:|Style\/reference similarity setting:|HIGHEST PRIORITY|PRODUCT IDENTITY|BRAND IDENTITY LOCK:|POSTER COPY|Negative prompt:|Reference summary:|Shared style anchor:|Generation guidance:|Case-library support:|Lighting\/material lock:/i.test(String(text || ''));
}
function smartGenerationAllowsHuman(node, refs=[], prompt=''){
    const latestUserRequest = smartLatestUserRequestText(node, prompt);
    if(smartTextExplicitlyRequestsHuman(latestUserRequest)) return true;
    if(smartTextExplicitlyForbidsHuman(latestUserRequest)) return false;
    if(String(latestUserRequest || '').trim()) return smartRefsLikelyContainPerson(node, refs);
    const intentText = smartNodeUserIntentText(node);
    if(smartTextExplicitlyRequestsHuman(intentText)) return true;
    if(smartTextExplicitlyForbidsHuman(intentText)) return false;
    if(smartTextExplicitlyForbidsHuman(prompt)) return false;
    if(!smartPromptLooksSystemGenerated(prompt) && smartTextExplicitlyRequestsHuman(prompt)) return true;
    return smartRefsLikelyContainPerson(node, refs);
}
function smartNoHumanSubjectPrompt(allowHuman=false){
    if(allowHuman) return '';
    return [
        'NO HUMAN SUBJECT LOCK:',
        'Do not include any person, human model, portrait, face, skin, hair, hands, fingers, arms, legs, body, silhouette, mannequin, or any human body part.',
        'This is a product-only / object-only scene. If style references, case-library matches, or older prompt fragments mention model, person, face, skin, pose, hand placement, holding, beauty portrait, or lifestyle person, ignore those human/body parts.',
        'Beauty, hair-care, skin-care, scalp-care, body-care, massage, or usage-effect wording does not imply a person unless the latest user request explicitly asks for a model, hand, body part, or human-use scene.',
        'Use product stands, props, packaging, surface contact, shadows, environment, machinery, particles, or lighting to support the product instead of hands or people.'
    ].join(' ');
}
function smartPosterCopyControlForGeneration(node, seen=new Set()){
    if(!node?.id || seen.has(node.id)) return null;
    seen.add(node.id);
    const ownsControl = node.type === 'smart-prompt'
        || (isGeneratedImagePromptComposerNode(node) && node?.generatedPromptInitialized);
    if(node.posterCopyEnabled === true) return true;
    if(ownsControl && node.posterCopyEnabled === false) return false;
    const upstream = inputNodesFor(node)
        .map(input => smartPosterCopyControlForGeneration(input, seen))
        .filter(value => value !== null);
    if(!upstream.length) return null;
    return upstream.some(Boolean);
}
function smartPosterCopyEnabledForGeneration(node){
    return smartPosterCopyControlForGeneration(node) === true;
}
function smartPosterCopyDisabledForGeneration(node){
    return smartPosterCopyControlForGeneration(node) === false;
}
function smartReferenceLikelyContainsPerson(node, ref){
    if(smartReferenceRoleIsProduct(ref) || smartReferenceRoleIsCase(ref)) return false;
    if(ref?.containsPerson === true || ref?.hasPerson === true || ref?.personReference === true || ref?.humanReference === true) return true;
    if(ref?.containsPerson === false || ref?.hasPerson === false || ref?.personReference === false || ref?.humanReference === false) return false;
    const text = smartFlattenTextValues([
        ref?.subjectKind,
        ref?.mediaCategory,
        ref?.name,
        ref?.title,
        ref?.categoryName,
        ref?.sourceName,
        ref?.description,
        ref?.caption,
        ref?.alt,
        ref?.prompt,
        ref?.runPrompt,
        ref?.llmInstruction
    ]).join(' ');
    if(!text.trim() || smartTextExplicitlyForbidsHuman(text)) return false;
    return smartHumanPositivePattern().test(smartStripHumanAntiCopyClauses(text));
}
function smartStyleReferenceShouldUpload(node, ref, weight){
    if(ref?.generatedEditBase || ref?.structureLock) return true;
    if(ref?.styleLock || ref?.referenceLock) return true;
    if(smartReferenceRoleIsProduct(ref)) return true;
    if(smartReferenceRoleIsCase(ref)) return false;
    const role = ref?.role || '';
    if(!['composition_reference','primary_style_reference','primary_reference'].includes(role)) return true;
    if(smartPosterCopyEnabledForGeneration(node)) return true;
    const value = Math.max(0, Math.min(100, Math.round(Number(weight) || 0)));
    if(smartPosterCopyDisabledForGeneration(node) && value >= 60) return true;
    if(smartReferenceLikelyContainsPerson(node, ref)){
        return value >= 85;
    }
    return value >= 60;
}
function smartPosterCopyReferenceFidelity(weight, strictLock=false){
    const value = Math.max(0, Math.min(100, Math.round(Number(weight) || 0)));
    return strictLock || value >= 85 ? 'high' : 'low';
}
function smartPosterCopySimilarityIntent(weight, fallback){
    const value = Math.max(0, Math.min(100, Math.round(Number(weight) || 0)));
    if(value >= 85) return fallback;
    if(value >= 60) return 'poster_copy_text_lock_balanced_visual';
    return 'poster_copy_text_lock_loose_visual';
}
function smartPersonSimilarityInstruction(weight=65){
    const value = Math.max(0, Math.min(100, Math.round(Number(weight) || 0)));
    if(value >= 85){
        return 'Person similarity: high. The model may share the same general beauty type and facial proportions, but must not be an identical face or exact same person; change micro-features, expression, hair detail, and gaze enough to avoid duplication.';
    }
    if(value >= 60){
        return 'Person similarity: medium. Use a different model/person with a similar commercial beauty category, styling level, age range, and mood. The face must be recognizably different: change face shape, eyes, lips, nose, hairline, hairstyle details, skin marks/moles, and gaze. Do not preserve exact facial identity or same-person likeness.';
    }
    if(value >= 35){
        return 'Person similarity: low. Generate a clearly different person. Keep only the campaign mood, styling category, lighting, and product interaction; do not copy the reference face or recognizable model identity.';
    }
    return 'Person similarity: very low. Treat the person in the reference as non-identity style inspiration only; create a new unrelated model/person.';
}
function smartFilterWeakCaseReferences(node, refs=[]){
    const images = imageRefsOnly(refs);
    const strong = images.filter(ref => !smartReferenceRoleIsCase(ref));
    const hasPrimary = strong.some(ref => smartReferenceRoleIsPrimary(node, ref));
    return hasPrimary && strong.length > 1
        ? (refs || []).filter(ref => !smartReferenceRoleIsCase(ref))
        : (refs || []);
}
function smartEvenlySampleReferences(refs=[], limit=3){
    const items = uniqueReferenceImages(refs);
    const max = Math.max(0, Number(limit) || 0);
    if(items.length <= max) return items;
    if(max <= 0) return [];
    if(max === 1) return items.slice(0, 1);
    const picked = [];
    for(let i = 0; i < max; i++){
        const idx = Math.round(i * (items.length - 1) / (max - 1));
        const item = items[idx];
        if(item && !picked.some(ref => ref?.url === item.url)) picked.push(item);
    }
    for(const item of items){
        if(picked.length >= max) break;
        if(item && !picked.some(ref => ref?.url === item.url)) picked.push(item);
    }
    return picked;
}
function smartExpensiveReferencePath(node, primary=[], products=[]){
    const styleWeight = promptNodeReferenceWeight(node);
    return Boolean(
        (smartPosterCopyEnabledForGeneration(node) || styleWeight >= 85)
        && primary.length
        && products.length >= 3
    );
}
function smartPrioritizeGenerationReferences(refs=[], node=null){
    const list = uniqueReferenceImages(refs);
    const generatedBase = list.filter(ref => ref?.generatedEditBase || ref?.structureLock);
    const allPrimary = list.filter(ref => !smartReferenceRoleIsCase(ref) && ['composition_reference','primary_style_reference','primary_reference'].includes(ref?.role));
    const primary = generatedBase.length
        ? generatedBase.slice(0, 1)
        : allPrimary;
    const secondaryGenerated = generatedBase.slice(1).map(ref => ({
        ...ref,
        role:'supporting_reference',
        generatedEditBase:false,
        structureLock:false,
        referenceLock:false,
        referenceWeight:Math.min(smartReferenceRoleWeight(ref), 55),
        similarityIntent:'supporting_generated_reference',
        inputFidelity:'low',
        uploadReference:true,
        textOnlyReference:false
    }));
    const explicitProducts = list.filter(ref => ref?.productTruthExplicit);
    const products = uniqueReferenceImages([
        ...explicitProducts,
        ...list.filter(ref => ref?.role === 'product_truth_reference' || ref?.role === 'product_detail_reference')
    ]);
    const primaryUrls = new Set(primary.map(ref => ref?.url).filter(Boolean));
    const allPrimaryUrls = new Set(allPrimary.map(ref => ref?.url).filter(Boolean));
    const productUrls = new Set(products.map(ref => ref?.url).filter(Boolean));
    const supporting = list.filter(ref => !primaryUrls.has(ref?.url) && !allPrimaryUrls.has(ref?.url) && !productUrls.has(ref?.url) && !smartReferenceRoleIsCase(ref));
    const expensive = smartExpensiveReferencePath(node, primary, products);
    const latestProductIdentity = typeof smartLatestProductIdentityOverrideValue === 'function'
        ? smartLatestProductIdentityOverrideValue(node)
        : '';
    const productLimit = primary.length ? (latestProductIdentity ? 4 : 3) : 4;
    const selectedProducts = expensive ? smartEvenlySampleReferences(products, productLimit) : products.slice(0, productLimit);
    const ordered = [
        ...primary.slice(0, 1),
        ...selectedProducts,
        ...secondaryGenerated,
        ...supporting
    ];
    return uniqueReferenceImages(ordered).slice(0, expensive && !latestProductIdentity ? 4 : 5);
}
function smartReferenceRoleWeight(ref){
    const raw = Number(ref?.referenceWeight ?? ref?.styleReferenceWeight ?? ref?.weight);
    if(Number.isFinite(raw)) return Math.max(0, Math.min(100, Math.round(raw)));
    if(ref?.generatedEditBase || ref?.structureLock) return 100;
    if(ref?.role === 'product_truth_reference' || ref?.role === 'product_detail_reference') return 100;
    if(ref?.role === 'composition_reference' || ref?.role === 'primary_style_reference' || ref?.role === 'primary_reference') return 60;
    if(ref?.role === 'case_style_reference') return 25;
    return 50;
}
function smartDecorateReferenceWeights(node, refs=[]){
    const styleWeight = promptNodeReferenceWeight(node);
    const latestChangesBackgroundPalette = smartLatestRequestChangesBackgroundPalette(node);
    const posterCopyLock = smartPosterCopyEnabledForGeneration(node);
    const posterCopyOff = smartPosterCopyDisabledForGeneration(node);
    return (refs || []).map(ref => {
        if(!ref?.url) return ref;
        const role = ref.role || '';
        if(role === 'product_truth_reference' || role === 'product_detail_reference'){
            return {
                ...ref,
                referenceWeight:100,
                similarityIntent:'strict_product_identity_only',
                inputFidelity:'high'
            };
        }
        if(role === 'composition_reference' || role === 'primary_style_reference' || role === 'primary_reference'){
            if(ref?.generatedEditBase || ref?.structureLock){
                const editBaseWeight = smartReferenceRoleWeight(ref);
                const strictEditBase = editBaseWeight >= 85;
                const editBaseIntent = generatedEditBaseSimilarityIntent(editBaseWeight);
                return {
                    ...ref,
                    referenceWeight:editBaseWeight,
                    similarityIntent:posterCopyLock
                        ? smartPosterCopySimilarityIntent(editBaseWeight, editBaseIntent)
                        : posterCopyOff
                            ? 'poster_copy_off_layout_reference'
                            : editBaseIntent,
                    inputFidelity:posterCopyLock ? smartPosterCopyReferenceFidelity(editBaseWeight, strictEditBase) : 'high',
                    uploadReference:true,
                    textOnlyReference:false,
                    referenceLock:strictEditBase,
                    structureLock:strictEditBase,
                    posterCopyReference:posterCopyLock,
                    copyTextLock:posterCopyLock && strictEditBase,
                    posterCopyDisabledReference:posterCopyOff,
                    copyTextRemovalOnly:posterCopyOff
                };
            }
            const upload = latestChangesBackgroundPalette
                && styleWeight < 85
                && !ref?.styleLock
                && !ref?.referenceLock
                && !posterCopyLock
                ? false
                : smartStyleReferenceShouldUpload(node, ref, styleWeight);
            const styleIntent = styleWeight >= 85 ? 'strong_style_not_clone' : styleWeight >= 60 ? 'balanced_style' : 'loose_style';
            return {
                ...ref,
                referenceWeight:styleWeight,
                similarityIntent:posterCopyLock
                    ? smartPosterCopySimilarityIntent(styleWeight, styleIntent)
                    : posterCopyOff && styleWeight >= 60
                        ? 'poster_copy_off_layout_reference'
                        : styleIntent,
                inputFidelity:posterCopyLock
                    ? smartPosterCopyReferenceFidelity(styleWeight)
                    : posterCopyOff && styleWeight >= 60
                        ? 'high'
                        : 'low',
                uploadReference:upload,
                textOnlyReference:!upload,
                latestVisualOverride:latestChangesBackgroundPalette,
                posterCopyReference:posterCopyLock,
                copyTextLock:posterCopyLock && styleWeight >= 85,
                posterCopyDisabledReference:posterCopyOff && upload,
                copyTextRemovalOnly:posterCopyOff && upload
            };
        }
        if(role === 'case_style_reference'){
            return {...ref, referenceWeight:25, similarityIntent:'weak_polish_only', inputFidelity:'low', textOnlyReference:true, uploadReference:false};
        }
        return {...ref, referenceWeight:Math.min(smartReferenceRoleWeight(ref), 55), inputFidelity:'low'};
    });
}
function smartNormalizeProductReferenceText(value){
    return String(value || '').replace(/[０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xFEE0));
}
function smartProductIntentText(node){
    return [
        node?.text,
        node?.promptDraftText,
        node?.llmInstruction,
        node?.llmSystemPrompt,
        node?.styleMatch?.analysis?.reference_summary?.product_truth,
        node?.styleMatch?.analysis?.style_fingerprint?.material?.product_surface
    ].map(v => typeof v === 'string' ? v : '').join(' ');
}
function smartProductCuePattern(){
    return /product|sku|packaging|package|same item|same product|reference product|held product|handheld product|hero product|my product|\u4ea7\u54c1|\u5546\u54c1|\u540c\u6b3e|\u5305\u88c5|\u53c2\u8003\u4ea7\u54c1|\u4ea7\u54c1\u56fe|\u6211\u7684\u4ea7\u54c1|\u8fd9\u6b3e\u4ea7\u54c1|\u624b\u4e2d|\u624b\u91cc|\u62ff\u7740|\u624b\u6301|\u4e3b\u89d2\u4ea7\u54c1/i;
}
function smartCleanProductIdentityName(value){
    let text = String(value || '').trim();
    text = text.replace(/^[\s"'`“”‘’:=：-]+|[\s"'`“”‘’.,，。;；!！?？]+$/g, '');
    text = text.replace(/^(?:\u4e00\s*)?(?:\u6b3e|\u4e2a|\u4ef6|\u79cd|\u53ea)\s*/i, '');
    text = text.replace(/\s*(?:\u53c2\u8003|\u6309|\u6839\u636e|\u751f\u6210|\u51fa\u56fe|\u505a|\u753b|\u4f5c\u4e3a)\s*.*$/i, '').trim();
    text = text.replace(/\s+/g, ' ');
    if(text.length < 2 || text.length > 60) return '';
    if(/^(?:\u4ea7\u54c1|\u5546\u54c1|\u56fe\u7247|\u53c2\u8003\u56fe|\u4e00\u5f20\u56fe|image|product|item)$/i.test(text)) return '';
    return text;
}
function smartExtractProductIdentityName(text){
    const value = String(text || '').trim();
    if(!value) return '';
    const patterns = [
        /LATEST PRODUCT IDENTITY OVERRIDE:[\s\S]{0,180}?product\/category as "([^"]{2,60})"/i,
        /(?:\u8fd9|\u8fd9\u4e2a|\u8fd9\u6b3e|\u8be5|\u6b64|this)\s*(?:\u662f|\u4e3a|\u5c5e\u4e8e|is|as)\s*(?:\u4e00\s*(?:\u6b3e|\u4e2a|\u4ef6|\u79cd|\u53ea)\s*)?([^\s,，.。;；!！?？、\n]{2,30})/i,
        /(?:\u4ea7\u54c1|\u5546\u54c1|sku|SKU|\u54c1\u7c7b|\u7c7b\u76ee|\u4e3b\u4f53|\u4e3b\u89d2\u4ea7\u54c1)\s*(?:\u662f|\u4e3a|\u53eb|\u5c5e\u4e8e|=|:|：|is|as)\s*(?:\u4e00\s*(?:\u6b3e|\u4e2a|\u4ef6|\u79cd|\u53ea)\s*)?([^\s,，.。;；!！?？、\n]{2,30})/i,
        /\b(?:product|item|sku|category)\s*(?:is|as|=|:)\s*([A-Za-z][A-Za-z0-9 -]{1,50})/i
    ];
    for(const pattern of patterns){
        const match = pattern.exec(value);
        const name = smartCleanProductIdentityName(match?.[1] || '');
        if(name) return name;
    }
    return '';
}
function smartLatestProductIdentityOverrideValue(node, prompt=''){
    const latest = smartLatestUserRequestText(node, prompt);
    const fromLatest = smartExtractProductIdentityName(latest);
    if(fromLatest) return fromLatest;
    return smartExtractProductIdentityName(prompt);
}
function smartLatestProductIdentityOverridePrompt(node, prompt='', refs=[]){
    const identity = smartLatestProductIdentityOverrideValue(node, prompt);
    if(!identity) return '';
    const productRefs = imageRefsOnly(refs)
        .map((ref, index) => ({ref, index}))
        .filter(item => item.ref?.role === 'product_truth_reference' || item.ref?.role === 'product_detail_reference');
    const labels = productRefs.map(item => smartReferenceDisplayLabel(item.index)).join(', ');
    return [
        'LATEST PRODUCT IDENTITY OVERRIDE:',
        `The latest user request names the product/category as "${identity}". Treat this as the authoritative product identity.`,
        labels ? `Use ${labels} as strict visual proof of the same "${identity}" SKU: shape, color, structure, controls, material, surface details, and scale must come from these product-truth images.` : '',
        'This overrides any conflicting product category, use-case, function claim, or old object implied by the primary poster/reference image, readable poster copy, style analysis, prior prompt, or case-library match.',
        'If Poster copy is enabled, preserve only brand/promotion/text-block hierarchy that remains compatible with this latest product identity. Rewrite, simplify, or omit copied words that describe a different product category or function.',
        `FINAL PRODUCT IDENTITY CHECK: the hero product and all readable product claims must read as "${identity}", not as the old reference product.`
    ].filter(Boolean).join(' ');
}
function smartAddProductIndexGroup(indexes, group){
    const text = smartNormalizeProductReferenceText(group);
    const nums = (text.match(/\d+/g) || []).map(n => Number(n)).filter(n => Number.isFinite(n));
    if(!nums.length) return;
    const hasRange = /-|to|through|\u81f3|\u5230/.test(text);
    if(hasRange && nums.length >= 2){
        const start = Math.max(1, Math.min(nums[0], nums[nums.length - 1]));
        const end = Math.min(SMART_REFERENCE_IMAGE_MAX, Math.max(nums[0], nums[nums.length - 1]));
        for(let n = start; n <= end; n++) indexes.add(n - 1);
        return;
    }
    nums.forEach(n => {
        if(n >= 1 && n <= SMART_REFERENCE_IMAGE_MAX) indexes.add(n - 1);
    });
}
function smartProductReferenceIndexes(node){
    const text = smartNormalizeProductReferenceText(smartProductIntentText(node));
    const indexes = new Set();
    if(!smartProductCuePattern().test(text)) return indexes;
    const patterns = [
        /(?:\u56fe\u7247|\u53c2\u8003\u56fe|\u4ea7\u54c1\u56fe|\u56fe|\u7167\u7247)\s*([0-9]+(?:\s*(?:[\u3001,\uFF0C/&+]|-|\u548c|\u53ca|\u81f3|\u5230)\s*[0-9]+)*)/g,
        /(?:image|img|ref|reference)(?:\s+images?)?\s*#?\s*([0-9]+(?:\s*(?:[,/&+]|-|to|and)\s*[0-9]+)*)/gi,
        /\u7b2c\s*([0-9]+(?:\s*(?:[\u3001,\uFF0C/&+]|-|\u548c|\u53ca|\u81f3|\u5230)\s*[0-9]+)*)\s*(?:\u5f20|\u4e2a)?(?:\u56fe|\u56fe\u7247|\u7167\u7247|\u53c2\u8003\u56fe)?/g
    ];
    patterns.forEach(pattern => {
        let match;
        while((match = pattern.exec(text))){
            smartAddProductIndexGroup(indexes, match[1]);
        }
    });
    return indexes;
}
function smartNodeRequestsProductTruth(node){
    return smartProductCuePattern().test(smartProductIntentText(node));
}
function smartAssignReferenceRoles(node, refs=[]){
    const images = imageRefsOnly(refs);
    const hasPrimary = images.some(ref => !smartReferenceRoleIsCase(ref) && smartReferenceRoleIsPrimary(node, ref));
    const wantsProductTruth = smartNodeRequestsProductTruth(node);
    const productIndexes = smartProductReferenceIndexes(node);
    const hasExplicitProductIndexes = productIndexes.size > 0;
    return (refs || []).map((ref, index) => {
        if(!ref?.url) return ref;
        const explicit = ref.role || '';
        if(explicit === 'case_style_reference') return {...ref, role:explicit};
        if(explicit === 'product_truth_reference' || explicit === 'product_detail_reference'){
            return {...ref, role:explicit, styleLock:false, referenceLock:false, productTruthExplicit:true};
        }
        if(explicit === 'composition_reference' || explicit === 'primary_style_reference' || explicit === 'primary_reference'){
            return {...ref, role:explicit};
        }
        if(productIndexes.has(index) && mediaKindForItem(ref) === 'image') return {...ref, role:'product_truth_reference', styleLock:false, referenceLock:false, productTruthExplicit:true};
        if(smartReferenceRoleIsPrimary(node, ref)) return {...ref, role:explicit === 'composition_reference' ? explicit : 'primary_style_reference'};
        if(smartReferenceRoleIsProduct(ref)) return {...ref, role:'product_truth_reference', styleLock:false, referenceLock:false, productTruthExplicit:true};
        if(wantsProductTruth && !hasExplicitProductIndexes && mediaKindForItem(ref) === 'image' && (images.length === 1 || index > 0)) return {...ref, role:'product_truth_reference', styleLock:false, referenceLock:false};
        if(hasPrimary && mediaKindForItem(ref) === 'image') return {...ref, role:'product_truth_reference', styleLock:false, referenceLock:false};
        if(index === 0 && mediaKindForItem(ref) === 'image') return {...ref, role:explicit || 'primary_reference'};
        return {...ref, role:explicit || 'supporting_reference'};
    });
}
function smartReferenceDisplayLabel(index){
    return `Image ${index + 1} / \u56fe${index + 1}`;
}
function smartProductTruthRolePrompt(refs=[], allowHuman=false){
    const imageRefs = imageRefsOnly(refs);
    const productRefs = imageRefs
        .map((ref, index) => ({ref, index}))
        .filter(item => item.ref?.role === 'product_truth_reference' || item.ref?.role === 'product_detail_reference');
    if(!productRefs.length) return '';
    const labels = productRefs.map(item => `${smartReferenceDisplayLabel(item.index)} (${item.ref.name || 'product reference'})`).join(', ');
    const parts = [
        `Product truth references: ${labels}.`,
        'These images define strict SKU identity and override conflicting objects in portrait, pose, or style references. If a style/poster reference shows a similar same-category product, treat that old product as a decoy placeholder, not product anatomy.',
        allowHuman
            ? 'Preserve category, silhouette, proportions, structural parts, opening/cap/nozzle geometry, material, colors, product-surface brand marks, logos, printed label text/graphics, label-block placement, edge thickness, finish, and real-world scale.'
            : 'Preserve category, silhouette, proportions, structural parts, shell seams, layer relationships, opening/cap/nozzle/display/control geometry, material, colors, product-surface brand marks, logos, printed label text/graphics, label-block placement, edge thickness, finish, and real-world scale.',
        allowHuman
            ? 'Treat multiple views as one consistent 3D product. Adapt hands, pose, placement, lighting, and composition around this exact product; never substitute a generic same-category object.'
            : 'Treat multiple views as one consistent 3D product. Adapt product placement, lighting, props, surface contact, and composition around this exact product; never substitute a generic same-category object and do not introduce hands or people.',
        'This product lock applies to the SKU only, not to the whole source photo; keep freedom to create a new shot.'
    ];
    if(!allowHuman){
        parts.splice(parts.length - 1, 0, 'For appliances, electronics, tools, furniture, or mechanical products, preserve how the upper shell, lower shell, controls, feet, internal modules, motors, coils, wiring, brackets, supports, and seams physically connect.');
    }
    return parts.join(' ');
}
function smartProductTruthContrastLockPrompt(refs=[], allowHuman=false){
    const imageRefs = imageRefsOnly(refs);
    const productRefs = imageRefs
        .map((ref, index) => ({ref, index}))
        .filter(item => item.ref?.role === 'product_truth_reference' || item.ref?.role === 'product_detail_reference');
    const styleRefs = imageRefs
        .map((ref, index) => ({ref, index}))
        .filter(item => ['composition_reference','primary_style_reference','primary_reference'].includes(item.ref?.role));
    if(!productRefs.length || !styleRefs.length) return '';
    const productLabels = productRefs.map(item => smartReferenceDisplayLabel(item.index)).join(', ');
    const styleLabels = styleRefs.map(item => smartReferenceDisplayLabel(item.index)).join(', ');
    return [
        'PRODUCT TRUTH VS STYLE PRODUCT CONTRAST LOCK:',
        `${styleLabels} are composition/poster references only; ${productLabels} are strict SKU references.`,
        'When a composition/poster reference contains an old or similar same-category product, treat that old product as a decoy placeholder. Do not use it as the product anatomy.',
        'Do not average, merge, or transplant any head/cap/nozzle shape, light or LED area, bristles, teeth, pins, circular control/display disk, button icons, handle curve, shell seam, accessory, color accent, or functional part from the composition/poster reference unless the same feature is clearly visible in the product-truth references.',
        'Preserve the product-truth silhouette and distinguishing visible features across views: front/side/top/back proportions, head or cap geometry, teeth/pins/bristle pattern, display/control placement, button/icon layout, seams, ridges, materials, color blocks, and real-world scale.',
        allowHuman
            ? 'Adapt the hand grip and pose around the exact product-truth geometry; hands may touch or hold the product but must not hide or redesign the distinguishing head, control, button, teeth/pins/bristles, or handle details.'
            : 'Adapt placement, lighting, props, and support surfaces around the exact product-truth geometry; do not add hands, people, or extra product-like parts.'
    ].join(' ');
}
function smartProductReplacementRolePrompt(refs=[], allowHuman=false){
    const images = imageRefsOnly(refs);
    const hasProduct = images.some(ref => ref?.role === 'product_truth_reference' || ref?.role === 'product_detail_reference');
    const hasStyle = images.some(ref => ['composition_reference','primary_style_reference','primary_reference'].includes(ref?.role));
    if(!hasProduct || !hasStyle) return '';
    return [
        'PRODUCT IDENTITY PRIORITY WITH NON-CLONE STYLE REFERENCE:',
        'The composition/style reference is a loose visual-direction reference for campaign mood, lighting quality, color world, styling level, and broad subject relationship only.',
        'Do not recreate the style reference as an identical or near-identical image. Change the exact pose, hand placement, facial expression, crop, product position, and small layout details unless the user explicitly requests exact copying.',
        'Any bottle, box, device, package, or old product visible or described in the composition/style reference is a replaceable placeholder and is NOT product truth.',
        allowHuman
            ? 'Only the product-truth reference images define the generated SKU. Replace the old reference product with that exact SKU and adapt the hand grip around its real geometry.'
            : 'Only the product-truth reference images define the generated SKU. Replace the old reference product with that exact SKU and adapt props, support surfaces, shadows, environment, and composition around its real geometry; do not add hands or people.',
        'Product-truth prompt nodes contribute identity and materials only. Ignore their standalone black/white background, floating-object, product-only, no-person, camera, crop, and layout instructions.',
        'Ignore every earlier phrase that calls the old reference object a hero product, generic product, serum bottle, dropper bottle, box, or alternate product shape.'
    ].join(' ');
}
function smartReferenceSimilarityRolePrompt(refs=[], allowHuman=false){
    const images = imageRefsOnly(refs);
    const editBaseRefs = images.filter(ref => ref?.generatedEditBase || ref?.structureLock);
    const styleRefs = images.filter(ref => ['composition_reference','primary_style_reference','primary_reference'].includes(ref?.role) && !(ref?.generatedEditBase || ref?.structureLock));
    const productRefs = images.filter(ref => ref?.role === 'product_truth_reference' || ref?.role === 'product_detail_reference');
    if(!editBaseRefs.length && !styleRefs.length && !productRefs.length) return '';
    const styleWeight = styleRefs.length ? Math.max(...styleRefs.map(ref => smartReferenceRoleWeight(ref))) : 0;
    const parts = [];
    if(editBaseRefs.length){
        const editBaseWeight = Math.max(...editBaseRefs.map(ref => smartReferenceRoleWeight(ref)));
        const editBasePosterCopy = editBaseRefs.some(ref => ref?.posterCopyReference || ref?.copyTextLock);
        const editBasePosterCopyOff = editBaseRefs.some(ref => ref?.posterCopyDisabledReference || ref?.copyTextRemovalOnly);
        const editBaseMode = editBaseWeight >= 85
            ? 'strict edit-base structure lock'
            : editBaseWeight >= 60
                ? 'balanced edit-base guidance'
                : 'loose edit-base inspiration';
        parts.push(`Edit-base reference strength: ${editBaseWeight}/100 (${editBaseMode}). ${editBaseWeight >= 85
            ? 'Treat the generated source image as the locked edit canvas for composition, crop family, subject scale, pose geometry, product placement, lighting direction, background color world, and negative-space rhythm; vary only what the latest user request asks to change.'
            : editBasePosterCopy
                ? 'Poster-copy is enabled at non-strict weight: use the source image mainly to read poster text and keep compatible product/material cues. Do not preserve its poster layout, camera, crop, product placement, border, badge map, background, or negative-space rhythm; rebuild the image as a fresh shot around the latest request.'
                : editBasePosterCopyOff
                    ? 'Poster-copy is disabled but visual similarity still matters: keep the source poster layout, subject/product placement, camera family, crop, palette, lighting, border/strip/badge positions, and commercial hierarchy according to this weight. Remove only readable poster overlay text and keep those areas as blank/non-readable design blocks.'
                : editBaseWeight >= 60
                ? 'Use the generated source image as the primary reference for the broad composition family, subject/product relationship, lighting direction, and commercial finish, while allowing the latest user request to change pose, crop, background, placement, or styling more freely.'
                : 'Use the generated source image as a loose visual starting point only; prioritize the latest user request and keep only non-conflicting product identity, broad mood, and useful material/lighting cues.'}`);
    }
    if(styleRefs.length){
        const mode = styleWeight >= 85
            ? 'strong style affinity but not an identical recreation'
            : styleWeight >= 60
                ? 'balanced style guidance with clear new-shot variation'
                : 'loose style inspiration';
        parts.push(allowHuman
            ? `Style/reference similarity setting: ${styleWeight}/100 (${mode}). Use style references for mood, lighting quality, palette, beauty-ad polish, broad subject relationship, and approximate scale only.`
            : `Style/reference similarity setting: ${styleWeight}/100 (${mode}). Use style references for mood, lighting quality, palette, advertising polish, product/environment relationship, and approximate scale only.`);
        if(styleWeight < 85 && styleRefs.some(ref => ref?.posterCopyReference || ref?.copyTextLock)){
            parts.push('Poster-copy text lock does not increase visual similarity: keep readable copy cues, but redesign the surrounding layout, product placement, background, camera, crop, props, and negative-space distribution as a new image.');
        }
        if(styleWeight >= 60 && styleRefs.some(ref => ref?.posterCopyDisabledReference || ref?.copyTextRemovalOnly)){
            parts.push('Poster-copy disabled does not reduce visual similarity: preserve the uploaded poster composition family, subject/product placement, camera family, crop, palette, lighting, graphic panels, border/strip/badge positions, bottom sale-bar geometry, and commercial hierarchy. Remove only readable poster overlay copy; keep product/package labels.');
        }
        if(allowHuman) parts.push(smartPersonSimilarityInstruction(styleWeight));
        else parts.push('Human/body similarity is disabled: do not transfer any person, face, model, skin, hands, pose, hand placement, or body-part content from the reference or case library.');
        parts.push(allowHuman
            ? 'Never reproduce the reference image as a one-to-one copy. Always alter exact crop, pose, hand placement, expression, product position, and small layout details unless the user explicitly asks for exact duplication.'
            : 'Never reproduce the reference image as a one-to-one copy. Always alter exact crop, product position, prop arrangement, surface contact, shadow, and small layout details unless the user explicitly asks for exact duplication.');
    }
    if(productRefs.length){
        parts.push('Product reference strength: 100/100 for SKU identity only. Product strength does not mean copying the whole reference photo.');
    }
    return parts.join(' ');
}
function smartEditBaseStructureLockPrompt(refs=[], userPrompt=''){
    const bases = imageRefsOnly(refs).filter(ref => ref?.generatedEditBase || ref?.structureLock);
    if(!bases.length) return '';
    const labels = bases.map((ref, index) => `${smartReferenceDisplayLabel(index)} (${ref.name || 'generated edit base'})`).join(', ');
    const request = String(userPrompt || '').trim();
    const weight = Math.max(...bases.map(ref => smartReferenceRoleWeight(ref)));
    if(weight < 60){
        return [
            'LOOSE EDIT-BASE REFERENCE:',
            `Use ${labels} as a loose visual starting point, not as a locked canvas.`,
            'Prioritize the latest user modification request. Keep only non-conflicting product identity, broad commercial mood, useful lighting/material cues, and any elements the user explicitly asks to preserve.',
            request ? `Latest edit request: ${request}` : ''
        ].filter(Boolean).join('\n');
    }
    if(weight < 85){
        return [
            'BALANCED EDIT-BASE REFERENCE:',
            `Use ${labels} as the primary source reference for broad structure, but not as a pixel-locked canvas.`,
            'Preserve the general subject/product relationship, commercial finish, and non-conflicting lighting/material cues, while allowing the latest user request to change pose, crop, camera distance, background layout, placement, or styling.',
            request ? `Latest edit request: ${request}` : ''
        ].filter(Boolean).join('\n');
    }
    return [
        'STRICT EDIT-BASE STRUCTURE LOCK:',
        `Use ${labels} as the actual source canvas for this edit, not just as loose inspiration.`,
        'The new result must visibly remain connected to the source image. Preserve the same overall composition skeleton, aspect/crop family, main subject count, subject scale hierarchy, face/body orientation, pose geometry, hand placement family, product-to-person relationship, object placement, background color world, lighting direction, and negative-space distribution unless the latest user request explicitly changes one of those items.',
        'Apply only the latest user modification request on top of that source structure. Do not invent a different portrait, different pose, different camera distance, different background layout, or unrelated product/model arrangement.',
        request ? `Latest edit request to apply within the locked source structure: ${request}` : ''
    ].filter(Boolean).join('\n');
}
function smartPersonIdentityOverridePrompt(refs=[], allowHuman=false){
    if(!allowHuman) return '';
    const images = imageRefsOnly(refs);
    const styleRefs = images.filter(ref => ['composition_reference','primary_style_reference','primary_reference'].includes(ref?.role));
    if(!styleRefs.length) return '';
    const styleWeight = Math.max(...styleRefs.map(ref => smartReferenceRoleWeight(ref)));
    return [
        'PERSON IDENTITY CONTROL:',
        smartPersonSimilarityInstruction(styleWeight),
        'This person-identity rule overrides any earlier prompt phrase such as identity reference, model identity, subject identity, same person, same model, preserve face, or keep the original face. Product identity remains strict and is controlled only by product references.'
    ].join(' ');
}
function smartUploadedReferenceMapPrompt(refs=[], allowHuman=false){
    const uploaded = imageRefsOnly(refs).filter(smartReferenceUploadAllowed);
    if(!uploaded.length) return '';
    const lines = uploaded.map((ref, index) => {
        const role = ref?.role || 'reference';
        const label = ref?.generatedEditBase || ref?.structureLock
            ? (smartReferenceRoleWeight(ref) >= 85 ? 'STRICT EDIT-BASE structure reference' : 'WEIGHTED EDIT-BASE reference')
            : ref?.posterCopyDisabledReference || ref?.copyTextRemovalOnly
            ? 'POSTER-LAYOUT reference with poster copy removed'
            : ref?.posterCopyReference || ref?.copyTextLock
            ? 'PRIMARY POSTER COPY reference'
            : role === 'product_truth_reference' || role === 'product_detail_reference'
            ? 'STRICT PRODUCT SKU reference'
            : role === 'composition_reference' || role === 'primary_style_reference' || role === 'primary_reference'
                ? 'uploaded style/composition reference'
                : 'supporting uploaded reference';
        return `Image ${index + 1}: ${label} (${ref?.name || role}).`;
    });
    return [
        'UPLOADED IMAGE ROLE MAP:',
        ...lines,
        allowHuman
            ? 'Only uploaded images in this map should be treated as visual inputs. Any earlier dropped/text-only style image is prompt guidance only and must not define the same person face.'
            : 'Only uploaded images in this map should be treated as visual inputs. Any earlier dropped/text-only style image is prompt guidance only and must not introduce a person, face, hand, body, or human pose.'
    ].join('\n');
}
function smartPosterCopyLockPrompt(node, refs=[]){
    if(!smartPosterCopyEnabledForGeneration(node)) return '';
    const uploaded = imageRefsOnly(refs).filter(ref => (ref?.posterCopyReference || ref?.copyTextLock) && smartReferenceUploadAllowed(ref));
    if(!uploaded.length) return '';
    const labels = uploaded.map((ref, index) => `${smartReferenceDisplayLabel(index)} (${ref.name || 'primary poster reference'})`).join(', ');
    const latestProductIdentity = smartLatestProductIdentityOverrideValue(node);
    return [
        'POSTER COPY LOCK:',
        `Use ${labels} as the authoritative source for readable poster/ad copy.`,
        'Use this as a text-reading reference, not as a full-image composition template.',
        'Preserve only the main readable headline, key price/offer, CTA, and important badge text when practical, with similar text-block placement and visual hierarchy.',
        latestProductIdentity ? `Product-copy compatibility override: the latest product identity is "${latestProductIdentity}". Do not preserve copied poster words that describe a different product category, body area, function, or usage scenario; adapt or simplify those words so the copy matches "${latestProductIdentity}".` : '',
        'Do not force exact line breaks, every small label, dense fine print, or pixel-level typography reconstruction; tiny text may become clean non-readable marks or simplified label blocks.',
        'Do not copy the whole poster layout, border treatment, badge positions, arrows, product placement, background, camera, crop, aspect ratio, or negative-space map unless the reference weight is high and the latest request explicitly asks for a close recreation.',
        'Product-detail references control only SKU/product appearance and must not suppress, remove, replace, translate, or invent the poster copy.',
        'This lock overrides earlier no-readable-text, no-brand-text, clean-no-text, or text-removal instructions unless the user explicitly switched Poster copy off. Do not interpret “do not invent random text” as permission to erase readable copy that already exists in the primary poster reference.',
        'Prefer a timely completed generation over perfect OCR of every minor text element.'
    ].filter(Boolean).join(' ');
}
function smartBrandIdentityPrompt(refs=[]){
    const uploaded = imageRefsOnly(refs).filter(smartReferenceUploadAllowed);
    if(!uploaded.length) return '';
    const labels = uploaded.map((ref, index) => `${smartReferenceDisplayLabel(index)} (${ref.name || 'reference'})`).join(', ');
    return [
        'BRAND IDENTITY LOCK:',
        `Preserve visible brand identity marks in ${labels} as mandatory anchors: top-left or top-corner brand logo, brand name/wordmark, product-line mark, and store/festival brand tag when present.`,
        'Do not remove, translate, redraw, or absorb those brand elements into the background even when Poster copy is disabled.',
        'Treat the logo/brand strip as a fixed header identity area, not as removable ad copy.',
        'Keep the brand area crisp, recognizable, and in the same relative position; only the marketing copy around it may be simplified or removed.',
        'Brand identity is higher priority than decorative typography and higher priority than text-removal cleanup.'
    ].join(' ');
}
function smartPosterCopyDisabledPrompt(node, refs=[]){
    if(smartPosterCopyEnabledForGeneration(node)) return '';
    const uploaded = imageRefsOnly(refs).filter(smartReferenceUploadAllowed);
    if(!uploaded.length) return '';
    return [
        'POSTER COPY OFF / PRODUCT LABELS ON:',
        'Use the uploaded primary reference as a close poster-layout and campaign-composition reference while removing readable poster/ad overlay text.',
        'Preserve the reference composition family according to the reference weight: subject/product placement, crop, camera family, color palette, lighting mood, background gradient, graphic panels, border/strip/badge positions, bottom sale-bar geometry, and commercial hierarchy.',
        'Remove or avoid readable poster/ad overlay text copied from the reference image: large headlines, slogans, price tags, CTA buttons, promotional badges, ranking medallions, banners, UI text, external watermarks, and decorative typography outside product surfaces.',
        'Preserve poster brand identity elements from the reference, including top-corner brand logos, brand names, product-line marks, and store/festival brand tags. These are identity anchors, not removable poster copy.',
        'Keep the removed text areas as clean blank space, non-readable short marks, or simple graphic blocks so the poster design remains close instead of collapsing into a lifestyle/product photo.',
        'Do not remove text printed on the product or package itself. Preserve product-surface brand marks, logos, bottle/box/tube labels, SKU names, volume marks, and printed packaging graphics as part of product identity.',
        'If tiny product text is not readable, keep clean label-like marks aligned to the real product surface instead of erasing the label area or inventing new marketing claims.',
        'Disabling Poster copy is only a poster-text removal control; it is not permission to redesign the product, palette, lighting, camera family, composition family, product scale, or commercial finish beyond the selected reference weight.'
    ].join(' ');
}
function smartProductHandInteractionPrompt(refs=[], allowHuman=false){
    const hasProduct = imageRefsOnly(refs).some(ref => ref?.role === 'product_truth_reference' || ref?.role === 'product_detail_reference');
    if(!hasProduct || !allowHuman) return '';
    return [
        'MANDATORY PRODUCT-HAND INTERACTION:',
        'The product must be physically held by the model hand. Show believable contact: fingers or palm wrapping, pinching, or supporting the real product body according to its shape.',
        'Do not let the product float, merely touch the cheek, stick to the face, appear as an earring, appear behind the hand, or be unsupported.',
        'If hands are visible, at least one fingertip or palm edge must overlap the product with correct occlusion and contact shadows. Rebuild the hand pose around the exact product geometry.'
    ].join(' ');
}
function smartMechanicalStructureIntentText(node, prompt='', refs=[]){
    const refText = (refs || []).map(ref => [ref?.name, ref?.role, ref?.title, ref?.categoryName].filter(Boolean).join(' ')).join(' ');
    return [
        prompt,
        smartNodeUserIntentText(node),
        refText,
        node?.styleMatch?.analysis?.reference_summary,
        node?.styleMatch?.analysis?.style_fingerprint,
        node?.styleMatch?.analysis?.generation_guidance,
        node?.styleMatch?.analysis?.positive_prompt
    ].map(value => typeof value === 'string' ? value : smartFlattenTextValues(value).join(' ')).join(' ');
}
function smartMechanicalStructurePrompt(node, refs=[], prompt=''){
    const hasProduct = imageRefsOnly(refs).some(ref => ref?.role === 'product_truth_reference' || ref?.role === 'product_detail_reference');
    if(!hasProduct) return '';
    const text = smartMechanicalStructureIntentText(node, prompt, refs);
    const mechanical = /motor|motors|engine|coil|copper coil|gear|bearing|rotor|stator|spring|wire|pcb|circuit|mechanism|mechanical|internal|inside|cutaway|exploded|cross[-\s]?section|appliance|device|machine|vibration|massage|\u7535\u673a|\u9a6c\u8fbe|\u7ebf\u5708|\u94dc\u7ebf|\u9f7f\u8f6e|\u8f74\u627f|\u8f6c\u5b50|\u5b9a\u5b50|\u5f39\u7c27|\u7535\u8def|\u7ebf\u675f|\u5185\u90e8|\u7ed3\u6784|\u673a\u68b0|\u7ec4\u4ef6|\u62c6\u89e3|\u7206\u70b8\u56fe|\u5256\u9762|\u5206\u5c42|\u5206\u5f00|\u632f\u52a8|\u6309\u6469|\u673a\u8eab|\u5916\u58f3|\u4e0a\u58f3|\u4e0b\u58f3|\u5e95\u58f3/.test(text);
    if(!mechanical) return '';
    return [
        'MECHANICAL STRUCTURE LOCK:',
        'When the product is a device, appliance, or mechanical object, the product-truth reference controls the physical assembly, not just the surface style.',
        'Preserve the real outer silhouette, top shell, lower shell, side seam/waist line, display/control module, rounded rim, feet, thickness, and perspective alignment from the product reference.',
        'If internal motors, coils, heating parts, wiring, or a technical cutaway/exploded layer is requested, show them as components inside the lower housing or revealed through a controlled midline split/cutaway. They must share the same perspective, scale, shadow, and contact relationship with the product body.',
        'Do not generate a separate second product, loose tray, duplicated base, unrelated motor platform, long exposed shafts, floating mechanical parts, or motors that replace the lower shell.',
        'If a specific motor count or component count is requested, render exactly that many compact internal modules and keep them attached to the product structure.'
    ].join(' ');
}
function smartSanitizeProductReplacementPrompt(prompt){
    const sections = String(prompt || '').split(/\n{2,}/).map(section => section.trim()).filter(Boolean);
    const dropHeadingPattern = /^(?:Reference anchors|Reference summary|Shared style anchor|Generation guidance|Variant plan|Case-library support|Loose style guidance|Composition lock|Lighting\/material lock):/i;
    const oldProductPattern = /\b(?:pink|gold|beige|champagne|dusty pink|silicone top|raised massage nodes|old product|reference object|serum bottle|dropper bottle|generic product)\b|粉|金|米色|香槟|硅胶|按摩凸点|旧产品|参考图产品/i;
    const keepPriorityPattern = /^(?:Highest priority user modification request|Active additional generation guidance|Latest product identity override|Product truth references|Product recognition summary|MECHANICAL STRUCTURE LOCK|NO HUMAN SUBJECT LOCK|UPLOADED IMAGE ROLE MAP|PRODUCT IDENTITY PRIORITY|LATEST PRODUCT IDENTITY OVERRIDE|Style\/reference similarity setting|Original reference similarity|Negative prompt|FINAL PRODUCT CHECK)/i;
    const kept = sections.filter(section => {
        if(keepPriorityPattern.test(section)) return true;
        if(dropHeadingPattern.test(section)) return false;
        if(oldProductPattern.test(section) && /(?:product_truth|hero product|product material|product surface|product body|massage device|appliance|SKU|产品|商品|主体|机身|材质|颜色)/i.test(section)){
            return false;
        }
        return true;
    });
    return smartNormalizePromptText(kept.join('\n\n'));
}
function smartProductReplacementStyleBridgePrompt(allowHuman=false){
    return [
        'STYLE REFERENCE ROLE FOR PRODUCT REPLACEMENT:',
        'Use the uploaded style/composition reference only for poster layout family, dark studio background, lighting direction, contrast, negative-space rhythm, camera family, commercial finish, and technical power/motor visualization concept.',
        'Ignore the old product in the style reference completely: its color, material, shell shape, top surface, buttons, display, logo, massage nodes, rim color, and component geometry are not allowed to define the new product.',
        allowHuman
            ? 'The product-truth reference controls the generated SKU and any permitted hand/product contact.'
            : 'The product-truth reference controls the generated SKU. Build a product-only scene around that exact product with no human body parts.'
    ].join(' ');
}
const smartProductRecognitionCache = new Map();
function smartProductTruthRefs(refs=[]){
    return imageRefsOnly(refs).filter(ref => ref?.role === 'product_truth_reference' || ref?.role === 'product_detail_reference');
}
function smartProductRecognitionCacheKey(refs=[]){
    return smartProductTruthRefs(refs).map(ref => `${ref.url || ''}|${ref.name || ''}`).join('||');
}
function smartProductRecognitionMessage(refs=[]){
    const labels = smartProductTruthRefs(refs).map((ref, index) => `Product reference ${index + 1}: ${ref.name || `Image ${index + 1}`}`).join('\n');
    return [
        'Analyze the attached product reference images for image generation.',
        labels,
        '',
        'Return a concise English product identity brief. Focus only on visible product truth:',
        '- exact product category and packaging format',
        '- silhouette, proportions, dimensions, front/back/side/top/underside structure',
        '- cap, nozzle, pump, opening, seal, tabs, folds, handle, box edges, bottle shape, pouch shape, shell seams, upper/lower body split, feet, buttons, display panels, vents, brackets, or other structural parts',
        '- distinctive features that separate this SKU from similar products in style/poster references',
        '- for brush, comb, massage, beauty, or handheld devices: exact head/cap shape, teeth/pins/bristle pattern, light/LED placement, circular control or display disk, button/icon layout, handle curves, shell seams, and contact surfaces',
        '- for devices or mechanical products: motor/coil/gear/wire/PCB locations, internal cavity relationship, shell layering, cutaway/exploded-view constraints, and what components must stay inside the body instead of becoming separate props',
        '- material and surface finish: paper, plastic, transparent film, glass, metal, matte, satin, glossy, translucent',
        '- dominant colors, accent colors, label blocks, icon placement, border lines, panel layout, readable text if legible',
        '- what must NOT change when generating a new scene',
        '',
        'Do not guess brand names or exact text that is unreadable. If text is unclear, describe it as unreadable label blocks with the same layout.'
    ].join('\n');
}
async function smartAnalyzeProductTruthRefs(refs=[], runSettings=settings){
    const productRefs = smartEvenlySampleReferences(smartProductTruthRefs(refs), 5);
    if(!productRefs.length) return '';
    const key = smartProductRecognitionCacheKey(productRefs);
    if(smartProductRecognitionCache.has(key)) return smartProductRecognitionCache.get(key);
    const provider = resolveChatProviderId(runSettings?.provider_id || '');
    const model = resolveChatModel('', provider);
    const result = await fetch('/api/canvas-llm', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            message:smartProductRecognitionMessage(productRefs),
            messages:[],
            images:productRefs.map(ref => ref.url).filter(Boolean),
            videos:[],
            model,
            provider,
            ms_model: provider === 'modelscope' ? model : '',
            system_prompt:'You are a precise commercial product visual analyst. Describe only visible product facts for image generation. Do not invent unreadable text.'
        })
    }).then(async r => {
        if(!r.ok) throw new Error(await r.text());
        return r.json();
    });
    const summary = String(result?.text || '').replace(/\s+/g, ' ').trim().slice(0, 900);
    smartProductRecognitionCache.set(key, summary);
    return summary;
}
async function smartPromptWithProductRecognition(prompt, refs=[], runSettings=settings){
    if(!runSettings?.productRecognitionEnabled) return prompt;
    const productRefs = smartProductTruthRefs(refs);
    if(!productRefs.length) return prompt;
    try {
        const summary = await smartAnalyzeProductTruthRefs(productRefs, runSettings);
        if(!summary) return prompt;
        const lock = [
            'Product recognition summary from product reference images:',
            summary,
            'Use this as the strict product identity and structure anchor. Keep the same product, structural relationships, shell/layer geometry, control/display placement, and label-block layout; do not substitute generic packaging, generic appliance geometry, separate loose parts, or invented unreadable text.'
        ].join('\n');
        return String(prompt || '').includes('Product recognition summary from product reference images:')
            ? prompt
            : [lock, prompt].filter(Boolean).join('\n\n');
    } catch(err) {
        console.warn('Product recognition failed; continuing with product truth lock.', err);
        return prompt;
    }
}
function visibleReferenceImagesFor(node){
    const candidates = smartFilterWeakCaseReferences(node, [
        ...defaultReferenceImagesFor(node),
        ...collectMentionedImagesFromPrompt()
    ]);
    const assigned = smartAssignReferenceRoles(node, uniqueReferenceImages(candidates));
    const finalRefs = smartPrioritizeGenerationReferences(assigned, node);
    return finalRefs;
}
function inputMentionCandidateImages(node){
    const current = node ? [...lineImagesFor(node), ...manualReferenceImagesFor(node)] : [];
    const seen = new Set();
    return current.filter(img => {
        if(!img?.url || seen.has(img.url)) return false;
        seen.add(img.url);
        return true;
    }).map((img, index) => ({
        ...img,
        mentionId:`mention_${index}_${Math.random().toString(36).slice(2, 7)}`,
        alias:img.name || `图片${index + 1}`
    }));
}
// 一个素材可注册到多个平台：收集所有「已通过」的 asset:// 地址，按平台映射。
function assetRegisteredUris(item){
    const regs = (item && item.registrations && typeof item.registrations === 'object') ? item.registrations : {};
    const out = {};
    Object.keys(regs).forEach(platform => {
        const reg = regs[platform];
        if(reg && reg.status === 'Active' && reg.asset_uri) out[platform] = reg.asset_uri;
    });
    return out;
}
function assetMentionCandidateImages(categoryId=''){
    const cats = assetCategories('image');
    const cat = cats.find(c => c.id === categoryId) || assetCategoryForMention();
    if(!cat) return [];
    mentionAssetCategoryId = cat.id;
    const items = (cat.items || []).map(item => ({...item, categoryName:cat.name || '', categoryId:cat.id}));
    const seen = new Set();
    return items.filter(item => {
        if(!item?.url || seen.has(item.url)) return false;
        seen.add(item.url);
        return true;
    }).map((item, index) => ({
        url:item.url,
        kind:assetMediaKind(item),
        name:item.name || `资产${index + 1}`,
        alias:item.name || `资产${index + 1}`,
        role:'asset',
        categoryName:item.categoryName || '',
        asset_uris:assetRegisteredUris(item),
        mentionId:`asset_${index}_${Math.random().toString(36).slice(2, 7)}`
    }));
}
function mentionCandidateImages(node, source=mentionSource){
    return source === 'asset' ? assetMentionCandidateImages(mentionAssetCategoryId) : inputMentionCandidateImages(node);
}
function referenceImagesFor(node){
    return defaultReferenceImagesFor(node);
}
function closeMentionPicker(){
    mentionPicker.classList.remove('open');
    mentionPicker.innerHTML = '';
    mentionAnchorEl = null;
    mentionInsertMode = 'token';
    if(selectedNode()) renderInputThumbsRow(selectedNode());
}
function saveMentionRange(){
    const sel = window.getSelection();
    if(sel && sel.rangeCount && promptInput.contains(sel.anchorNode)){
        mentionRange = sel.getRangeAt(0).cloneRange();
    }
}
function textBeforeCaret(){
    const sel = window.getSelection();
    if(!sel || !sel.rangeCount || !promptInput.contains(sel.anchorNode)) return '';
    const range = sel.getRangeAt(0).cloneRange();
    range.selectNodeContents(promptInput);
    range.setEnd(sel.anchorNode, sel.anchorOffset);
    return range.toString();
}
function renderMentionPicker(source){
    const node = selectedNode();
    const inputItems = inputMentionCandidateImages(node);
    const assetLibs = assetLibraries();
    if(!activeAssetLibraryId || !assetLibs.some(lib => lib.id === activeAssetLibraryId)) activeAssetLibraryId = assetLibrary.active_library_id || assetLibs[0]?.id || '';
    const libraryWithMentionAssets = assetLibs.find(lib => (lib.categories || []).some(cat => (cat.type || 'image') === 'image' && (cat.items || []).some(item => item?.url)));
    const assetCats = assetCategories('image');
    const hasInput = inputItems.length > 0;
    const hasAssets = Boolean(libraryWithMentionAssets);
    mentionSource = source || (hasInput ? 'input' : 'asset');
    if(mentionSource === 'asset' && hasAssets && !assetCats.some(cat => (cat.items || []).some(item => item?.url)) && libraryWithMentionAssets){
        activeAssetLibraryId = libraryWithMentionAssets.id;
        activeAssetCategoryId = '';
        mentionAssetCategoryId = '';
    }
    if(mentionSource === 'input' && !hasInput && hasAssets) mentionSource = 'asset';
    if(mentionSource === 'asset' && !hasAssets && hasInput) mentionSource = 'input';
    if(!hasInput && !hasAssets){ closeMentionPicker(); return; }
    const nextAssetCats = assetCategories('image');
    const currentAssetCat = assetCategoryForMention();
    const assetItems = assetMentionCandidateImages(currentAssetCat?.id || '');
    const candidates = (mentionSource === 'asset' ? assetItems : inputItems).slice(0, 36);
    const body = candidates.length ? `<div class="mention-option-grid">${candidates.map((img, i) => `
            <button class="mention-option" type="button" data-mention-index="${i}">
                ${mentionOptionMediaHtml(img)}
                <span>${escapeHtml(img.alias)}</span>
            </button>
        `).join('')}</div>` : `<div class="mention-empty">${escapeHtml(tr('smart.mentionEmpty'))}</div>`;
    const librarySelect = (mentionSource === 'asset' && assetLibs.length)
        ? `<label class="mention-library-row"><span>${escapeHtml(tr('smart.assetLibrary'))}</span><select class="mention-library-select" data-mention-library>${assetLibs.map(lib => `<option value="${escapeHtml(lib.id)}" ${lib.id === activeAssetLibraryId ? 'selected' : ''}>${escapeHtml(lib.name || '资产库')}</option>`).join('')}</select></label>`
        : '';
    const folderChips = (mentionSource === 'asset' && nextAssetCats.length)
        ? nextAssetCats.map(cat => {
            const label = cat.name || tr('smart.assetFolder');
            return `<button class="mention-folder-chip ${cat.id === mentionAssetCategoryId ? 'active' : ''}" type="button" data-mention-folder="${escapeHtml(cat.id)}" title="${escapeHtml(label)}">${escapeHtml(label)}</button>`;
          }).join('')
        : '';
    mentionPicker.innerHTML = `
        <div class="mention-picker-shell">
            <div class="mention-source-tabs">
                <button class="mention-source-tab ${mentionSource === 'input' ? 'active' : ''}" type="button" data-mention-source="input" title="${escapeHtml(tr('smart.mentionInput'))}" ${hasInput ? '' : 'disabled'}>
                    <i data-lucide="image"></i><span>${escapeHtml(tr('smart.mentionInput'))}</span>
                </button>
                <button class="mention-source-tab ${mentionSource === 'asset' ? 'active' : ''}" type="button" data-mention-source="asset" title="${escapeHtml(tr('smart.mentionAssets'))}" ${hasAssets ? '' : 'disabled'}>
                    <i data-lucide="library"></i><span>${escapeHtml(tr('smart.mentionAssets'))}</span>
                </button>
            </div>
            ${librarySelect}
            <div class="mention-folder-chips ${folderChips ? '' : 'hidden'}">
                ${folderChips}
            </div>
            <div class="mention-content">
                ${body}
            </div>
        </div>
    `;
    mentionPicker._items = candidates;
    bindSmartPreviewImageFallbacks(mentionPicker);
    if(mentionInsertMode === 'manual-ref'){
        placeMentionPickerInComposerCard();
        renderInputThumbsRow(selectedNode());
        mentionAnchorEl = inputThumbsRow?.querySelector('[data-input-add-reference]') || inputThumbsRow;
    } else {
        placeMentionPickerInPromptRow();
    }
    positionMentionPickerAtCaret();
    mentionPicker.classList.add('open');
    mentionPicker.querySelectorAll('[data-mention-source]').forEach(btn => {
        btn.addEventListener('mousedown', e => {
            e.preventDefault(); e.stopPropagation();
            if(btn.disabled) return;
            renderMentionPicker(btn.dataset.mentionSource);
        });
    });
    mentionPicker.querySelectorAll('[data-mention-library]').forEach(select => {
        select.addEventListener('mousedown', e => e.stopPropagation());
        select.addEventListener('change', e => {
            activeAssetLibraryId = e.target.value || '';
            activeAssetCategoryId = '';
            mentionAssetCategoryId = '';
            renderAssetLibrary();
            renderMentionPicker('asset');
        });
    });
    mentionPicker.querySelectorAll('[data-mention-folder]').forEach(btn => {
        btn.addEventListener('mousedown', e => {
            e.preventDefault(); e.stopPropagation();
            mentionAssetCategoryId = btn.dataset.mentionFolder || '';
            renderMentionPicker('asset');
        });
    });
    mentionPicker.querySelectorAll('[data-mention-index]').forEach(btn => {
        btn.addEventListener('mousedown', e => {
            e.preventDefault(); e.stopPropagation();
            const item = mentionPicker._items[Number(btn.dataset.mentionIndex)];
            if(mentionInsertMode === 'manual-ref') addManualReferenceToSelectedNode(item);
            else insertMentionToken(item);
        });
    });
    refreshIcons();
}
function showMentionPicker(){
    const node = selectedNode();
    const hasInput = inputMentionCandidateImages(node).length > 0;
    mentionInsertMode = 'token';
    mentionAnchorEl = null;
    placeMentionPickerInPromptRow();
    mentionSource = hasInput ? 'input' : 'asset';
    renderMentionPicker(mentionSource);
}
function setPromptCaretToEnd(){
    if(!promptInput) return;
    promptInput.focus();
    const range = document.createRange();
    range.selectNodeContents(promptInput);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    mentionRange = range.cloneRange();
}
function toggleAssetMentionPickerFromThumbs(){
    if(!selectedNode()) return;
    if(mentionInsertMode === 'manual-ref'){
        closeMentionPicker();
        return;
    }
    mentionInsertMode = 'manual-ref';
    renderInputThumbsRow(selectedNode());
    mentionAnchorEl = inputThumbsRow?.querySelector('[data-input-add-reference]') || inputThumbsRow;
    renderMentionPicker('asset');
}
function addManualReferenceToSelectedNode(img){
    const node = selectedNode();
    if(!node || !img?.url) return;
    const kind = img.kind || mediaKindForItem(img);
    const ref = {
        url:img.url,
        name:img.alias || img.name || (kind === 'audio' ? '音频' : kind === 'video' ? '视频' : '图片'),
        kind,
        nodeId:img.nodeId || '',
        imageIndex:Number.isFinite(Number(img.imageIndex)) ? Number(img.imageIndex) : '',
        asset_uris:img.asset_uris || {},
        manualAdded:true
    };
    if(img.originalLocalUrl) ref.originalLocalUrl = img.originalLocalUrl;
    const refs = Array.isArray(node.manualInputRefs) ? node.manualInputRefs.slice() : [];
    const key = inputRefKey(ref);
    const exists = refs.some(item => inputRefKey(item) === key || item.url === ref.url);
    if(exists){
        closeMentionPicker();
        return;
    }
    pushUndo();
    refs.push(ref);
    node.manualInputRefs = refs;
    closeMentionPicker();
    renderInputThumbsRow(node);
    scheduleSave();
}
function removeManualReferenceFromSelectedNode(key){
    const node = selectedNode();
    if(!node || !key || !Array.isArray(node.manualInputRefs)) return;
    const refs = node.manualInputRefs.slice();
    const index = refs.findIndex(ref => inputRefKey(ref) === key || ref?.url === key.replace(/^url\|/, ''));
    if(index < 0) return;
    pushUndo();
    refs.splice(index, 1);
    node.manualInputRefs = refs;
    if(!refs.length) delete node.manualInputRefs;
    renderInputThumbsRow(node);
    scheduleSave();
}
function placeMentionPickerInPromptRow(){
    const row = promptInput?.closest?.('.prompt-row');
    if(row && mentionPicker.parentElement !== row) row.insertBefore(mentionPicker, promptResize || null);
}
function placeMentionPickerInComposerCard(){
    const card = promptInput?.closest?.('.composer-card');
    if(card && mentionPicker.parentElement !== card) card.appendChild(mentionPicker);
}
function positionMentionPickerAtCaret(){
    const row = promptInput.closest('.prompt-row');
    const rowRect = row.getBoundingClientRect();
    if(mentionAnchorEl){
        const anchorRect = mentionAnchorEl.getBoundingClientRect();
        const scale = (typeof viewport !== 'undefined' && Number(viewport?.scale)) || 1;
        const safeScale = scale > 0 ? scale : 1;
        const pickerWidth = mentionPicker.offsetWidth || 340;
        const base = mentionPicker.offsetParent || mentionPicker.parentElement || row;
        const baseRect = base.getBoundingClientRect();
        const baseLogicalWidth = baseRect.width / safeScale;
        const rawLeft = (anchorRect.right - baseRect.left) / safeScale - pickerWidth;
        const rawTop = (anchorRect.bottom - baseRect.top) / safeScale + 2;
        const left = Math.max(4, Math.min(rawLeft, Math.max(4, baseLogicalWidth - pickerWidth - 4)));
        mentionPicker.style.left = `${left}px`;
        mentionPicker.style.top = `${Math.max(2, rawTop)}px`;
        return;
    }
    let caretRect = null;
    const sel = window.getSelection();
    if(sel && sel.rangeCount){
        const range = sel.getRangeAt(0).cloneRange();
        caretRect = range.getClientRects()[0] || range.getBoundingClientRect();
    }
    const inputRect = promptInput.getBoundingClientRect();
    // composer 在 world 里被 viewport.scale 缩放过，getBoundingClientRect 返回的是缩放后的屏幕像素，
    // 而 style.left/top 是逻辑像素 → 需要除以 scale 才能正确还原 caret 的逻辑坐标
    const scale = (typeof viewport !== 'undefined' && Number(viewport?.scale)) || 1;
    const safeScale = scale > 0 ? scale : 1;
    const rowLogicalWidth = rowRect.width / safeScale;
    const pickerWidth = mentionPicker.offsetWidth || 340;
    const maxLeft = Math.max(4, rowLogicalWidth - pickerWidth - 4);
    const rawLeft = ((caretRect?.left || inputRect.left) - rowRect.left) / safeScale - 6;
    const rawTop = ((caretRect?.bottom || inputRect.top + 24) - rowRect.top) / safeScale + 2;
    const left = Math.max(4, Math.min(rawLeft, maxLeft));
    const top = Math.max(2, rawTop);
    mentionPicker.style.left = `${left}px`;
    mentionPicker.style.top = `${top}px`;
}
function maybeOpenMentionPicker(){
    saveMentionRange();
    const before = textBeforeCaret();
    if(/@$/.test(before)) showMentionPicker();
    else closeMentionPicker();
}
function insertMentionToken(img){
    if(!img?.url) return;
    promptInput.focus();
    const sel = window.getSelection();
    if(mentionRange){
        sel.removeAllRanges();
        sel.addRange(mentionRange);
    }
    const range = sel.rangeCount ? sel.getRangeAt(0) : document.createRange();
    let removedAt = false;
    if(range.startContainer?.nodeType === Node.TEXT_NODE && range.startOffset > 0){
        const text = range.startContainer.textContent || '';
        if(text[range.startOffset - 1] === '@'){
            range.setStart(range.startContainer, range.startOffset - 1);
            range.deleteContents();
            removedAt = true;
        }
    }
    if(!removedAt) {
        const walker = document.createTreeWalker(promptInput, NodeFilter.SHOW_TEXT);
        let lastText = null;
        while(walker.nextNode()) lastText = walker.currentNode;
        if(lastText && /@$/.test(lastText.textContent || '')) {
            lastText.textContent = lastText.textContent.slice(0, -1);
            range.selectNodeContents(promptInput);
            range.collapse(false);
        }
    }
    const token = document.createElement('span');
    token.className = 'mention-image-token';
    token.contentEditable = 'false';
    token.dataset.url = img.url;
    token.dataset.kind = mediaKindForItem(img);
    token.dataset.name = img.alias || img.name || (token.dataset.kind === 'audio' ? '音频' : token.dataset.kind === 'video' ? '视频' : '图片');
    token.dataset.nodeId = img.nodeId || '';
    token.dataset.imageIndex = String(img.imageIndex ?? '');
    token.dataset.assetUris = JSON.stringify(img.asset_uris || {});
    token.innerHTML = `${mentionTokenMediaHtml(img, token.dataset.kind)}<span>${escapeHtml(token.dataset.name)}</span>`;
    range.insertNode(token);
    bindSmartPreviewImageFallbacks(token);
    const spacer = document.createTextNode(' ');
    token.after(spacer);
    range.setStartAfter(spacer);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    closeMentionPicker();
    promptInput.focus();
    renderInputThumbsRow(selectedNode());
}
function collectPromptParts(){
    const parts = [];
    const walk = node => {
        if(node.nodeType === Node.TEXT_NODE){
            if(node.textContent) parts.push({type:'text', text:node.textContent});
            return;
        }
        if(node.nodeType !== Node.ELEMENT_NODE) return;
        if(node.classList?.contains('mention-image-token')){
            let assetUris = {};
            try { assetUris = JSON.parse(node.dataset.assetUris || '{}') || {}; } catch(e) { assetUris = {}; }
            const kind = node.dataset.kind || 'image';
            parts.push({type:'image', kind, url:node.dataset.url || '', name:node.dataset.name || (kind === 'audio' ? '音频' : '图片'), nodeId:node.dataset.nodeId || '', imageIndex:Number(node.dataset.imageIndex || 0), asset_uris:assetUris});
            return;
        }
        if(node.tagName === 'BR'){
            parts.push({type:'text', text:'\n'});
            return;
        }
        const blockTags = new Set(['DIV','P','LI','SECTION','ARTICLE','HEADER','FOOTER','BLOCKQUOTE']);
        const isBlock = node !== promptInput && blockTags.has(node.tagName);
        if(isBlock && parts.length && parts[parts.length - 1]?.text && !/\n$/.test(parts[parts.length - 1].text)) parts.push({type:'text', text:'\n'});
        node.childNodes.forEach(walk);
        if(isBlock) parts.push({type:'text', text:'\n'});
    };
    promptInput.childNodes.forEach(walk);
    return parts;
}
function originalPromptTextFromParts(parts){
    let text = '';
    (parts || []).forEach(part => {
        if(part.type === 'text'){
            text += part.text || '';
            return;
        }
        if(part.type === 'image') text += `@${part.name || '图片'}`;
    });
    return text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
function highestPriorityUserInstruction(text){
    const value = String(text || '').trim();
    if(!value) return '';
    return [
        'Highest priority user modification request:',
        value,
        'Apply this latest user request with highest priority. If it conflicts with earlier upstream prompt, strict composition lock, or reference-weight instructions, obey this latest modification while preserving only the non-conflicting reference style/product details.'
    ].join('\n');
}
function smartReferenceRequestPayload(img, index){
    return {
        url:img.url,
        name:img.name || `图${index + 1}`,
        kind:img.kind || mediaKindForItem(img),
        asset_uris:img.asset_uris || {},
        styleLock:Boolean(img.styleLock),
        referenceLock:Boolean(img.referenceLock),
        sourceNodeId:img.sourceNodeId || img.nodeId || '',
        sourceImageIndex:Number.isFinite(Number(img.sourceImageIndex)) ? Number(img.sourceImageIndex) : img.imageIndex,
        role:img.role || `image_${index + 1}`,
        referenceWeight:Number.isFinite(Number(img.referenceWeight)) ? Number(img.referenceWeight) : undefined,
        similarityIntent:img.similarityIntent || '',
        inputFidelity:img.inputFidelity || '',
        textOnlyReference:Boolean(img.textOnlyReference),
        uploadReference:img.uploadReference !== false,
        generatedEditBase:Boolean(img.generatedEditBase),
        structureLock:Boolean(img.structureLock),
        productTruthExplicit:Boolean(img.productTruthExplicit),
        posterCopyReference:Boolean(img.posterCopyReference),
        copyTextLock:Boolean(img.copyTextLock),
        containsPerson:img.containsPerson === true ? true : img.containsPerson === false ? false : undefined,
        hasPerson:img.hasPerson === true ? true : img.hasPerson === false ? false : undefined,
        personReference:img.personReference === true ? true : img.personReference === false ? false : undefined,
        humanReference:img.humanReference === true ? true : img.humanReference === false ? false : undefined
    };
}
function buildPromptRequest(node, overrideDefaultImages=null, consumeDefault=false, ctx=smartLoopContext){
    const parts = collectPromptParts();
    const originalPrompt = originalPromptTextFromParts(parts);
    const blockedRefs = blockedInputRefKeys(node);
    const hasOverrideImages = Array.isArray(overrideDefaultImages);
    const filteredDefaultImages = smartFilterWeakCaseReferences(node, hasOverrideImages ? overrideDefaultImages : defaultReferenceImagesFor(node, consumeDefault, ctx))
        .filter(img => !blockedRefs.has(inputRefKey(img)));
    const defaultRefs = uniqueReferenceImages(filteredDefaultImages);
    const refs = smartAssignReferenceRoles(node, defaultRefs.map((img, index) => ({...img, role:img.role || `image_${index + 1}`})));
    let hasMentionToken = false;
    const refMap = new Map();
    refs.forEach((img, index) => refMap.set(img.url, index + 1));
    let body = '';
    parts.forEach(part => {
        if(part.type === 'text'){
            body += part.text;
            return;
        }
        if(!part.url) return;
        hasMentionToken = true;
        const mentionedKey = inputRefKey(part);
        if(blockedRefs.has(mentionedKey)){
            body += `@${part.name || '图片'}`;
            return;
        }
        if(!refMap.has(part.url)){
            if(refs.length >= SMART_REFERENCE_IMAGE_MAX){
                body += `@${part.name || '图片'}`;
                return;
            }
            refMap.set(part.url, refs.length + 1);
            refs.push({url:part.url, name:part.name || `图${refs.length + 1}`, nodeId:part.nodeId, imageIndex:part.imageIndex, kind:part.kind || 'image', asset_uris:part.asset_uris || {}, styleLock:Boolean(part.styleLock), referenceLock:Boolean(part.referenceLock), role:`image_${refs.length + 1}`});
        }
        body += `图${refMap.get(part.url)}`;
    });
    body = body.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    const groupPrompt = isSmartGroupNode(node) ? textForNode(node, ctx).trim() : '';
    const inputPrompt = inputPromptTextFor(node, ctx).trim();
    if(groupPrompt || inputPrompt) {
        const manualOverride = highestPriorityUserInstruction(body);
        body = [groupPrompt, inputPrompt, manualOverride].filter(Boolean).join('\n\n');
    }
    const displayPrompt = originalPrompt || body;
    if(hasMentionToken && refs.length){
        const mapText = refs.map((img, i) => `图${i + 1}：${img.name || `图片${i + 1}`}`).join('\n');
        return {
            prompt:`${tr('smart.refMapHeader')}\n${mapText}\n\n${tr('smart.refUserNeed')}\n${body}`,
            displayPrompt,
            refs:refs.map(smartReferenceRequestPayload),
            mentioned:true
        };
    }
    return {
        prompt:body,
        displayPrompt,
        refs:refs.map(smartReferenceRequestPayload),
        mentioned:false
    };
}
const buildPromptRequestBase = buildPromptRequest;
buildPromptRequest = function(node, overrideDefaultImages=null, consumeDefault=false, ctx=smartLoopContext){
    const request = buildPromptRequestBase(node, overrideDefaultImages, consumeDefault, ctx);
    const refs = smartDecorateReferenceWeights(node, smartPrioritizeGenerationReferences(smartAssignReferenceRoles(node, request.refs || []), node));
    const allowHuman = smartGenerationAllowsHuman(node, refs, request.prompt || request.displayPrompt || '');
    const noHumanPrompt = smartNoHumanSubjectPrompt(allowHuman);
    const editBasePrompt = smartEditBaseStructureLockPrompt(refs, request.displayPrompt || request.prompt || '');
    const rolePrompt = smartProductTruthRolePrompt(refs, allowHuman);
    const productContrastPrompt = smartProductTruthContrastLockPrompt(refs, allowHuman);
    const replacementPrompt = smartProductReplacementRolePrompt(refs, allowHuman);
    const replacementMode = Boolean(replacementPrompt);
    const productOnlyReplacementMode = replacementMode && !allowHuman;
    const rawCleanRequestPrompt = productOnlyReplacementMode
        ? smartSanitizeProductReplacementPrompt(request.prompt || '')
        : (request.prompt || '');
    const cleanRequestPrompt = smartLatestRequestChangesBackgroundPalette(node, rawCleanRequestPrompt)
        ? smartStripStaleBackgroundPaletteLocks(rawCleanRequestPrompt)
        : rawCleanRequestPrompt;
    const similarityPrompt = smartReferenceSimilarityRolePrompt(refs, allowHuman);
    const personOverridePrompt = smartPersonIdentityOverridePrompt(refs, allowHuman);
    const uploadedMapPrompt = smartUploadedReferenceMapPrompt(refs, allowHuman);
    const posterCopyLockPrompt = smartPosterCopyLockPrompt(node, refs);
    const posterCopyDisabledPrompt = smartPosterCopyDisabledPrompt(node, refs);
    const handInteractionPrompt = smartProductHandInteractionPrompt(refs, allowHuman);
    const brandIdentityPrompt = smartBrandIdentityPrompt(refs);
    const latestProductIdentityPrompt = smartLatestProductIdentityOverridePrompt(node, cleanRequestPrompt || request.displayPrompt || request.prompt || '', refs);
    const mechanicalStructurePrompt = allowHuman ? '' : smartMechanicalStructurePrompt(node, refs, cleanRequestPrompt || request.displayPrompt || '');
    const styleBridgePrompt = productOnlyReplacementMode ? smartProductReplacementStyleBridgePrompt(false) : '';
    const roleParts = [
        noHumanPrompt,
        uploadedMapPrompt,
        latestProductIdentityPrompt,
        replacementPrompt,
        styleBridgePrompt,
        rolePrompt && !String(cleanRequestPrompt || '').includes('Product truth references:') ? rolePrompt : '',
        productContrastPrompt,
        mechanicalStructurePrompt,
        handInteractionPrompt,
        brandIdentityPrompt,
        posterCopyLockPrompt,
        posterCopyDisabledPrompt,
        editBasePrompt,
        similarityPrompt,
        personOverridePrompt,
        cleanRequestPrompt,
        replacementPrompt
            ? (allowHuman
                ? 'FINAL PRODUCT CHECK: any object held or touched by the permitted human must match the attached product-truth images, not the old object in the style reference.'
                : 'FINAL PRODUCT CHECK: the hero object must match the attached product-truth images, not the old object in the style reference. No person, hand, arm, face, or body part may appear.')
            : ''
    ];
    const prompt = roleParts.filter(Boolean).join('\n\n');
    return {
        ...request,
        prompt,
        refs:refs.map((img, index) => ({
            ...img,
            name:img.name || `Image ${index + 1}`,
            role:img.role || `image_${index + 1}`
        }))
    };
};
function outgoingConnectionsFor(node, kinds=['input']){
    if(!node) return [];
    const allowed = new Set(kinds);
    return (canvas?.connections || []).filter(conn => conn.from === node.id && allowed.has(conn.kind || 'flow'));
}
function outgoingInputConnectionsFor(node){
    return outgoingConnectionsFor(node, ['input']);
}
function nextOutputPositionForSource(sourceNode, pendingBox, options={}){
    const sourceRect = nodeRect(sourceNode);
    const x = (sourceRect.x || 0) + sourceRect.width + 80;
    const gap = 28;
    const outputs = outgoingConnectionsFor(sourceNode, ['input','flow'])
        .map(conn => nodes.find(n => n.id === conn.to))
        .filter(n => isSmartImageNode(n))
        .map(n => nodeRect(n))
        .filter(rect => Math.abs((rect.x || 0) - x) < Math.max(320, (pendingBox?.w || 260) + 120))
        .sort((a, b) => (a.y || 0) - (b.y || 0));
    if(!outputs.length) return {x, y:sourceRect.y || 0};
    let y = sourceRect.y || 0;
    for(const rect of outputs){
        const bottom = (rect.y || 0) + (rect.height || 0) + gap;
        if(y < bottom) y = bottom;
    }
    return {x, y};
}
function reusableAutoOutputForSource(sourceNode){
    if(!sourceNode?.id) return null;
    const connected = outgoingConnectionsFor(sourceNode, ['input','flow'])
        .map(conn => nodes.find(n => n.id === conn.to))
        .filter(n => isSmartImageNode(n) && !isHistoryGroupNode(n))
        .filter(n => !n.jimengPending && !smartPendingTasks(n).length && !Number(n.pending || 0));
    const marked = connected.filter(n => n.autoBranchOutputSourceId === sourceNode.id);
    return marked.sort((a, b) => Number(b.runAt || b.created_at || 0) - Number(a.runAt || a.created_at || 0))[0] || null;
}
function resetAutoOutputForRun(output, sourceNode, expectedCount, pendingBox, meta, options={}){
    output.images = [];
    output.pending = Math.max(1, Number(expectedCount) || 1);
    output.running = false;
    output.runStartedAt = nowMs();
    delete output.runFinishedAt;
    delete output.runElapsedMs;
    output.runTimerHidden = false;
    output.w = pendingBox.w;
    output.h = pendingBox.h;
    output.scale = MEDIA_NODE_DEFAULT_SCALE;
    output.title = 'Image';
    output.outputKind = 'image';
    output.autoBranchOutputSourceId = sourceNode.id;
    output._selectAfterRunId = options.selectOutput ? output.id : sourceNode.id;
    attachRunMeta(output, options.stripInputMeta ? stripRunInputMeta(meta) : meta);
    selectedId = sourceNode.id;
    selectedImage = {nodeId:'', index:-1};
    return output;
}
function createPendingOutputFromSource(sourceNode, expectedCount, meta, options={}){
    const pendingBox = pendingBoxSize(expectedCount, {sourceNode, refs:options.refs || meta?.promptRefs || []});
    const reusable = options.reuse === false ? null : reusableAutoOutputForSource(sourceNode);
    if(reusable) return resetAutoOutputForRun(reusable, sourceNode, expectedCount, pendingBox, meta, options);
    const pos = nextOutputPositionForSource(sourceNode, pendingBox);
    const output = {
        id:uid('smart'),
        type:'smart-image',
        x:pos.x,
        y:pos.y,
        title:'Image',
        images:[],
        pending:Math.max(1, Number(expectedCount) || 1),
        runStartedAt:nowMs(),
        runTimerHidden:false,
        w:pendingBox.w,
        h:pendingBox.h,
        scale:MEDIA_NODE_DEFAULT_SCALE,
        created_at:Date.now()
    };
    output.autoBranchOutputSourceId = sourceNode.id;
    output._selectAfterRunId = options.selectOutput ? output.id : sourceNode.id;
    nodes.push(output);
    if(options.connectSource === false) addConnection(sourceNode.id, output.id, 'flow');
    else connectInputNode(sourceNode.id, output.id);
    attachRunMeta(output, options.stripInputMeta ? stripRunInputMeta(meta) : meta);
    selectedId = sourceNode.id;
    selectedImage = {nodeId:'', index:-1};
    return output;
}
function createParallelLoopOutputNode(templateNode, sourceNode, roundIndex, roundOffset=0){
    const rect = nodeRect(templateNode);
    const output = cloneSmartNode(templateNode, 0, 0);
    output.id = uid('smart');
    output.type = 'smart-image';
    output.x = (Number(templateNode.x) || 0) + (Number(rect.width) || 260) + 80;
    output.y = (Number(templateNode.y) || 0) + roundOffset * ((Number(rect.height) || 180) + 28);
    output.title = `Image ${roundIndex}`;
    output.images = [];
    output.pending = 0;
    output.running = false;
    output.created_at = Date.now();
    delete output.w;
    delete output.h;
    delete output.historyFor;
    delete output.isHistoryGroup;
    delete output.sourceNodeId;
    delete output.runAt;
    delete output.runPrompt;
    delete output.runModelPrompt;
    delete output.runPromptRefs;
    delete output.runInputRefs;
    // 克隆自模板节点会带上 inputNodeIds（含上游提示词节点），而生成出的输出槽并未真正
    // 连线到这些上游；若不清空，节点即便没有任何连线也会一直显示"上游输入xxxx"。
    output.inputNodeIds = [];
    delete output.blockedInputRefs;
    delete output.manualInputRefs;
    nodes.push(output);
    connectInputNode(sourceNode.id, output.id);
    return output;
}
function loopOutputSlotsForRoot(rootNode){
    if(!rootNode?.id) return [];
    return downstreamNodesForId(rootNode.id)
        .filter(n => isSmartImageNode(n) && !isHistoryGroupNode(n))
        .sort((a, b) => {
            const ax = Number(a.x) || 0, bx = Number(b.x) || 0;
            if(ax !== bx) return ax - bx;
            return (Number(a.y) || 0) - (Number(b.y) || 0);
        });
}
function loopOutputSlotForRound(rootNode, loopNode, roundIndex, slotIndex){
    if(!rootNode?.id) return null;
    const candidates = loopOutputSlotsForRoot(rootNode)
        .filter(node => node.sourceNodeId === rootNode.id)
        .filter(node => !loopNode?.id || !node.loopSourceId || node.loopSourceId === loopNode.id);
    const untagged = candidates.filter(node => !Number.isFinite(Number(node.loopRoundIndex)) && !Number.isFinite(Number(node.loopSlotIndex)));
    return candidates.find(node => Number(node.loopRoundIndex) === Number(roundIndex))
        || candidates.find(node => Number(node.loopSlotIndex) === Number(slotIndex))
        || untagged[Math.max(0, Number(slotIndex) || 0)]
        || null;
}
function tagLoopOutputSlot(output, rootNode, loopNode, roundIndex, slotIndex){
    if(!output) return output;
    output.sourceNodeId = rootNode?.id || output.sourceNodeId || '';
    output.loopSourceId = loopNode?.id || output.loopSourceId || '';
    output.loopRootId = rootNode?.id || output.loopRootId || '';
    output.loopRoundIndex = Number(roundIndex) || 0;
    output.loopSlotIndex = Math.max(0, Number(slotIndex) || 0);
    return output;
}
function createLoopOutputSlot(rootNode, roundIndex, roundOffset=0, options={}){
    const rootRect = nodeRect(rootNode);
    const output = cloneSmartNode(rootNode, 0, 0);
    output.id = uid('smart');
    output.type = 'smart-image';
    output.x = (Number(rootNode.x) || 0) + (Number(rootRect.width) || 260) + 80;
    output.title = `Image ${roundIndex}`;
    output.images = [];
    output.pending = options.pending ? Math.max(1, Number(options.pending) || 1) : 0;
    output.running = Boolean(options.pending);
    output.queued = Boolean(options.queued);
    if(options.pending){
        output.runStartedAt = nowMs();
        output.runTimerHidden = false;
    }
    output.created_at = Date.now();
    delete output.w;
    delete output.h;
    delete output.historyFor;
    delete output.isHistoryGroup;
    delete output.sourceNodeId;
    delete output.runAt;
    delete output.runPrompt;
    delete output.runModelPrompt;
    delete output.runPromptRefs;
    delete output.runInputRefs;
    delete output.runFinishedAt;
    delete output.runElapsedMs;
    // 同 createParallelLoopOutputNode：清空克隆带来的 inputNodeIds，否则输出槽虽只用 flow
    // 连接到 root，却会因继承 root 的 inputNodeIds 而误显示上游提示词输入。
    output.inputNodeIds = [];
    delete output.blockedInputRefs;
    delete output.manualInputRefs;
    tagLoopOutputSlot(output, rootNode, options.loopNode || null, roundIndex, options.slotIndex ?? roundOffset);
    const slots = loopOutputSlotsForRoot(rootNode).map(nodeRect);
    let y = (Number(rootNode.y) || 0) + roundOffset * ((Number(rootRect.height) || 180) + 28);
    slots.forEach(rect => {
        if((Number(rect.x) || 0) >= (Number(output.x) || 0) - 24){
            y = Math.max(y, (Number(rect.y) || 0) + (Number(rect.height) || 0) + 28);
        }
    });
    output.y = y;
    nodes.push(output);
    addConnection(rootNode.id, output.id, 'flow');
        const runPath = smartCascadePathForCtx(options.ctx || options.runState);
        if(runPath?.states) runPath.states[`${rootNode.id}->${output.id}`] = 'wait';
    return output;
}
function extractCurrentImagesToSource(node, meta=null){
    const imgs = (node.images || []).slice();
    if(!imgs.length) return null;
    const r = nodeRect(node);
    const newX = (node.x || 0) - Math.max(280, r.width + 60);
    const source = {
        id: uid('smart'),
        type: 'smart-image',
        x: newX,
        y: node.y || 0,
        title: imgs.length > 1 ? 'Group' : 'Image',
        // 抽出到上游源节点的图片只保留"原始素材"语义：清空 runPrompt / runSettings /
        // sourceNodeId / runAt / promptDraftHtml / promptDraftText 等"生成"相关字段，
        // 避免上游图片继承下游输出的提示词信息
        images: imgs.map(img => stripImageGenerationMeta({...img})),
        created_at: Date.now()
    };
    if(Number.isFinite(Number(node.w))) source.w = node.w;
    if(Number.isFinite(Number(node.h))) source.h = node.h;
    if(Number.isFinite(Number(node.scale))) source.scale = node.scale;
    nodes.push(source);
    connectInputNode(source.id, node.id);
    node.images = [];
    delete node.w;
    delete node.h;
    return source;
}
function finalizePendingNode(pendingNode, urls, meta, kind='image'){
    if(!pendingNode) return;
    pendingNode = liveSmartNode(pendingNode);
    const ext = kind === 'video' ? 'mp4' : kind === 'audio' ? 'mp3' : kind === 'text' ? 'txt' : 'png';
    const imgs = urls.map((item, i) => {
        const url = typeof item === 'string' ? item : item?.url || '';
        const itemKind = (typeof item === 'object' && item.kind) || kind;
        return copyMediaSizeFields(item, {url, name:(typeof item === 'object' && item.name) || `output-${i + 1}.${ext}`, kind:itemKind, generatedResult:true});
    }).filter(img => img.url);
    pendingNode.images = imgs;
    if(pendingNode.autoBranchOutputSourceId) removeHistoryGroupForNode(pendingNode);
    markSmartNodeComplete(pendingNode, meta);
    pendingNode.outputKind = kind;
    if(imgs.length > 1) pendingNode.title = kind === 'video' ? 'Videos' : kind === 'audio' ? 'Audios' : kind === 'text' ? 'Texts' : 'Group';
    else pendingNode.title = kind === 'video' ? 'Video' : kind === 'audio' ? 'Audio' : kind === 'text' ? 'Text' : kind === 'file' ? 'File' : 'Image';
    pendingNode.scale = mediaNodeDefaultScale(pendingNode);
    clearSmartNodeExplicitSize(pendingNode);
    const metaTarget = pendingNode._runMetaTargetId ? nodes.find(n => n.id === pendingNode._runMetaTargetId) : pendingNode;
    if(metaTarget) attachRunMeta(metaTarget, meta);
    pendingNode.images = (pendingNode.images || []).map(img => stripImageGenerationMeta(img));
    clearSourceBusyStateIfDownstreamDone(nodes.find(n => n.id === meta?.sourceNodeId));
    selectedId = pendingNode._selectAfterRunId || pendingNode.id;
    delete pendingNode._runMetaTargetId;
    delete pendingNode._selectAfterRunId;
    if(activeComposerSubject?.id && selectedId === activeComposerSubject.id) lastComposerNodeId = `${selectedId}:node`;
    selectedImage = {nodeId:'', index:-1};
}
function restoreFromExtraction(node, extracted){
    if(!node || !extracted) return;
    node.images = extracted.images.slice();
    if(Number.isFinite(Number(extracted.w))) node.w = extracted.w;
    if(Number.isFinite(Number(extracted.h))) node.h = extracted.h;
    nodes = nodes.filter(n => n.id !== extracted.id);
    canvas.connections = (canvas.connections || []).filter(c => !(c.from === extracted.id && c.to === node.id));
    if(Array.isArray(node.inputNodeIds)){
        node.inputNodeIds = node.inputNodeIds.filter(id => id !== extracted.id);
    }
}
function restoreSourceVisualState(node, state){
    if(!node || !state) return;
    node.images = (state.images || []).map(img => ({...img}));
    node.title = state.title || (node.images.length > 1 ? 'Group' : 'Image');
    ['w','h','scale','outputKind'].forEach(key => {
        if(state[key] === undefined) delete node[key];
        else node[key] = state[key];
    });
}
function styleMatchedPromptRunTargets(promptNode){
    if(!promptNode?.id) return [];
    const direct = downstreamImageTargetsFor(promptNode);
    if(!direct.length) return [];
    const preferred = [...direct].sort((a, b) => {
        const ar = nodeRect(a);
        const br = nodeRect(b);
        const ax = Number(ar.x) || 0, bx = Number(br.x) || 0;
        if(ax !== bx) return bx - ax;
        const ay = Number(ar.y) || 0, by = Number(br.y) || 0;
        if(ay !== by) return by - ay;
        return Number(b.created_at || b.runAt || 0) - Number(a.created_at || a.runAt || 0);
    })[0];
    return preferred ? [preferred] : [];
}
function createStylePromptFreshOutputNode(promptNode, templateNode){
    if(!promptNode || !templateNode) return null;
    const templateRect = nodeRect(templateNode);
    const output = cloneSmartNode(templateNode, 0, 0);
    const pos = nextOutputPositionForSource(templateNode, {
        w:templateRect.width || Number(templateNode.w) || 260,
        h:templateRect.height || Number(templateNode.h) || 180
    });
    output.type = 'smart-image';
    output.x = pos.x;
    output.y = pos.y;
    output.title = 'Image';
    output.images = [];
    output.pending = 0;
    output.running = false;
    output.created_at = Date.now();
    delete output.w;
    delete output.h;
    delete output.historyFor;
    delete output.isHistoryGroup;
    delete output.sourceNodeId;
    delete output.autoBranchOutputSourceId;
    delete output.runAt;
    delete output.runPrompt;
    delete output.runModelPrompt;
    delete output.runPromptRefs;
    delete output.runInputRefs;
    delete output.runSettings;
    delete output.runFinishedAt;
    delete output.runElapsedMs;
    output.inputNodeIds = [];
    delete output.blockedInputRefs;
    delete output.manualInputRefs;
    nodes.push(output);
    connectInputNode(promptNode.id, output.id);
    return output;
}
function stylePromptOutputNodeForRun(promptNode, targetNode){
    if(!targetNode) return null;
    if(smartNodeHasDisplayResult(targetNode) || targetNode.runAt || targetNode.runModelPrompt || targetNode.runPrompt){
        return createStylePromptFreshOutputNode(promptNode, targetNode);
    }
    return targetNode;
}
function primaryGeneratedImageRefForNode(node){
    const outputs = nonPreviewOutputImages(node?.images || []);
    const img = outputs.find(item => item?.generatedResult) || outputs[0];
    if(!img?.url) return null;
    const weight = generatedEditBaseReferenceWeight(node);
    const strictEditBase = weight >= 85;
    return {
        ...img,
        url:smartOriginalMediaUrl(img),
        kind:mediaKindForItem(img) || 'image',
        name:img.name || 'Generated edit base',
        role:'composition_reference',
        sourceNodeId:node.id,
        sourceImageIndex:0,
        generatedEditBase:true,
        structureLock:strictEditBase,
        referenceLock:strictEditBase,
        referenceWeight:weight,
        similarityIntent:generatedEditBaseSimilarityIntent(weight),
        inputFidelity:'high',
        uploadReference:true,
        textOnlyReference:false
    };
}
function isGeneratedImagePromptComposerNode(node){
    if(!isSmartImageNode(node) || isHistoryGroupNode(node) || !smartNodeHasDisplayResult(node)) return false;
    const outputs = nonPreviewOutputImages(node?.images || []);
    return outputs.some(img => img?.generatedResult) || Boolean(node?.runPrompt || node?.runModelPrompt || node?.generatedPromptInitialized);
}
function generatedImageProductRefs(node){
    const editBaseUrl = smartReferenceUrlKey(primaryGeneratedImageRefForNode(node)?.url || '');
    const stored = imageRefsOnly(node?.imageEditRefs || []).filter(ref => smartReferenceUrlKey(ref.url) !== editBaseUrl);
    if(stored.length) return stored.map(ref => ({
        ...ref,
        role:'product_detail_reference',
        productTruthExplicit:true,
        referenceWeight:100,
        inputFidelity:'high',
        uploadReference:true,
        textOnlyReference:false
    }));
    const runRefs = imageRefsOnly(node?.runInputRefs || []);
    const candidates = runRefs.length > 1 ? runRefs.slice(1) : [];
    return candidates.map((ref, index) => ({
        ...ref,
        name:ref.name || `Product reference ${index + 1}`,
        role:'product_detail_reference',
        productTruthExplicit:true,
        referenceWeight:100,
        inputFidelity:'high',
        uploadReference:true,
        textOnlyReference:false
    }));
}
function generatedImagePromptReferences(node){
    const editBase = primaryGeneratedImageRefForNode(node);
    return uniqueReferenceImages([
        editBase,
        ...generatedImageProductRefs(node)
    ].filter(Boolean)).slice(0, SMART_REFERENCE_IMAGE_MAX);
}
function ensureGeneratedImagePromptComposerState(node){
    if(!isGeneratedImagePromptComposerNode(node)) return node;
    const editBase = primaryGeneratedImageRefForNode(node);
    const initialWeight = generatedEditBaseReferenceWeight(node);
    if(node.generatedPromptInitialized !== true){
        const initialPrompt = String(node.text || node.runModelPrompt || node.runPrompt || node.promptDraftText || '').trim();
        node.text = initialPrompt;
        node.promptDraftText = initialPrompt;
        node.promptDraftHtml = escapeHtml(initialPrompt);
        node.llmEnabled = true;
        node.llmProvider = resolveChatProviderId(node.llmProvider || '');
        node.llmModel = preferredPromptRematchModel(node.llmProvider);
        node.referenceWeight = initialWeight;
        node.generatedEditBaseReferenceWeight = initialWeight;
        node.styleMatch = {
            ...(node.styleMatch || {}),
            image:editBase?.url || node.styleMatch?.image || '',
            referenceWeight:initialWeight,
            analysis:node.styleMatch?.analysis || {},
            cases:Array.isArray(node.styleMatch?.cases) ? node.styleMatch.cases : []
        };
        node.imageEditRefs = generatedImagePromptReferences(node);
        node.generatedPromptInitialized = true;
    }
    const weight = generatedEditBaseReferenceWeight(node);
    node.text = String(node.text || node.promptDraftText || node.runModelPrompt || node.runPrompt || '').trim();
    node.llmProvider = resolveChatProviderId(node.llmProvider || '');
    node.llmModel = preferredPromptRematchModel(node.llmProvider);
    node.styleMatch = {
        ...(node.styleMatch || {}),
        image:editBase?.url || node.styleMatch?.image || '',
        referenceWeight:weight
    };
    node.referenceWeight = weight;
    node.generatedEditBaseReferenceWeight = weight;
    return node;
}
function imageNodeSmartRematchRequest(node){
    return String(node?.llmInstruction || '').trim();
}
async function smartRematchImageNodeRun(node, runSettings=settings){
    if(!isSmartImageNode(node) || isHistoryGroupNode(node)) return null;
    ensureGeneratedImagePromptComposerState(node);
    const userRequest = imageNodeSmartRematchRequest(node);
    if(!userRequest) throw new Error('请先在 LLM 修改框里写这次要改的内容');
    const editBase = primaryGeneratedImageRefForNode(node);
    if(!editBase?.url) return null;
    const provider = resolveChatProviderId(node.llmProvider || '');
    const model = preferredPromptRematchModel(provider);
    const currentPrompt = String(node.text || node.promptDraftText || node.runModelPrompt || node.runPrompt || '').trim();
    const cameraControl = promptNodeCameraPrompt(node);
    const editBaseWeight = generatedEditBaseReferenceWeight(node);
    const response = await fetch('/api/style-library/rematch-prompt', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            image:editBase.url,
            analysis:{},
            current_prompt:currentPrompt,
            user_request:userRequest,
            camera_control:cameraControl,
            poster_copy_enabled:node.posterCopyEnabled === true,
            provider,
            model,
            ms_model: provider === 'modelscope' ? model : '',
            limit:4,
            reference_weight:editBaseWeight
        })
    });
    const data = await response.json().catch(() => ({}));
    if(!response.ok) throw new Error(data.detail || '重新匹配当前图片提示词失败');
    const rawPrompt = String(data.prompt || data.analysis?.positive_prompt || '').trim();
    if(!rawPrompt) throw new Error('当前图片重新匹配后没有生成可用提示词');
    const promptBudget = smartCompressPromptToBudget(rawPrompt, SMART_MATCHED_PROMPT_BUDGET);
    const prompt = promptBudget.prompt;
    smartNotifyPromptCompression(promptBudget);
    node.text = prompt;
    node.promptDraftText = prompt;
    node.promptDraftHtml = escapeHtml(prompt);
    node.llmInstruction = '';
    node.imageEditRefs = uniqueReferenceImages([
        editBase,
        ...generatedImageProductRefs(node)
    ]);
    node.llmProvider = provider;
    node.llmModel = model;
    node.generatedPromptRematched = true;
    node.styleMatch = {
        ...(node.styleMatch || {}),
        query:data.query || '',
        cases:Array.isArray(data.cases) ? data.cases : [],
        analysis:data.analysis || {},
        model:data.model || model,
        rematchModel:model,
        image:editBase.url,
        source:data.source || '',
        referenceWeight:editBaseWeight,
        rematched_at:Date.now()
    };
    return data;
}
async function runGeneratedImagePromptRematch(nodeId){
    const node = nodes.find(item => item.id === nodeId);
    if(!isGeneratedImagePromptComposerNode(node) || node.promptRematching) return;
    pushUndo();
    node.promptRematching = true;
    renderGeneratedImagePromptComposer(node);
    try {
        toast('正在用 GPT-5.5 以当前生成图为基准重新匹配提示词...');
        const data = await smartRematchImageNodeRun(node, smartSettingsForNode(node));
        scheduleSave();
        render();
        toast(`已重新匹配 ${Array.isArray(data?.cases) ? data.cases.length : 0} 个素材库案例，并替换当前提示词`);
    } catch(error) {
        toast((error.message || '重新匹配当前图片提示词失败').slice(0, 180));
    } finally {
        const latest = nodes.find(item => item.id === nodeId);
        if(latest) latest.promptRematching = false;
        scheduleSave();
        render();
    }
}
async function rematchStylePromptForPromptNode(node){
    const userRequest = promptNodeStyleRematchRequest(node).trim();
    if(!userRequest) throw new Error('请先在 LLM 修改框里写这次要改的场景要求');
    const provider = resolveChatProviderId(node.llmProvider || '');
    const model = preferredPromptRematchModel(provider);
    const rematchImage = promptNodeStyleRematchImage(node);
    const currentReferenceBrief = promptNodeCurrentReferenceRoleBrief(node);
    const cameraControl = promptNodeCameraPrompt(node);
    const currentPrompt = [
        currentReferenceBrief,
        promptNodePromptItems({...node, llmInstruction:''}).join('\n\n').trim() || String(node.text || '').trim()
    ].filter(Boolean).join('\n\n');
    const response = await fetch('/api/style-library/rematch-prompt', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            image:rematchImage,
            analysis:node.styleMatch?.analysis || {},
            current_prompt:currentPrompt,
            user_request:userRequest,
            camera_control:cameraControl,
            poster_copy_enabled:node.posterCopyEnabled === true,
            provider,
            model,
            ms_model: provider === 'modelscope' ? model : '',
            limit:4,
            reference_weight:promptNodeReferenceWeight(node)
        })
    });
    const data = await response.json().catch(() => ({}));
    if(!response.ok) throw new Error(data.detail || '重新匹配素材库失败');
    const rawPrompt = String(data.prompt || data.analysis?.positive_prompt || '').trim();
    if(!rawPrompt) throw new Error('重新匹配后没有生成可用提示词');
    const promptBudget = smartCompressPromptToBudget(rawPrompt, SMART_MATCHED_PROMPT_BUDGET);
    node.text = promptBudget.prompt;
    node.llmInstruction = '';
    node.llmProvider = provider;
    node.llmModel = model;
    node.styleMatch = {
        ...(node.styleMatch || {}),
        query:data.query || '',
        cases:Array.isArray(data.cases) ? data.cases : [],
        analysis:data.analysis || node.styleMatch?.analysis || {},
        model:data.model || model,
        rematchModel:model,
        image:rematchImage || node.styleMatch?.image || '',
        source:data.source || node.styleMatch?.source || '',
        referenceWeight:promptNodeReferenceWeight(node),
        rematched_at:Date.now()
    };
    smartNotifyPromptCompression(promptBudget);
    return data;
}
function syncComposerPromptMatchButton(){
    if(!composerPromptMatchBtn) return;
    const text = promptPlainText().trim();
    const disabled = composerPromptMatching || !composer?.classList?.contains('open') || promptInput?.dataset?.promptLocked === '1' || !text;
    composerPromptMatchBtn.disabled = disabled;
    composerPromptMatchBtn.classList.toggle('matching', composerPromptMatching);
    composerPromptMatchBtn.title = composerPromptMatching ? '匹配中' : '匹配提示词';
    composerPromptMatchBtn.setAttribute('aria-label', composerPromptMatching ? '匹配中' : '匹配提示词');
    composerPromptMatchBtn.innerHTML = `<i data-lucide="${composerPromptMatching ? 'loader-2' : 'sparkles'}"></i><span>${composerPromptMatching ? '匹配中' : '匹配提示词'}</span>`;
    refreshIcons();
}
async function matchComposerPromptFromText(){
    if(composerPromptMatching) return;
    const userRequest = promptPlainText().trim();
    if(!userRequest){ toast('请先输入要生成的画面需求'); return; }
    const subject = activeComposerNode() || selectedNode();
    if(subject && !isSmartRunnableNode(subject)){ toast('请选择图片/上传节点后再匹配提示词'); return; }
    const provider = resolveChatProviderId(settings.provider_id || '');
    const model = preferredPromptRematchModel(provider);
    pushUndo();
    composerPromptMatching = true;
    syncComposerPromptMatchButton();
    toast('正在用 GPT-5.5 匹配提示词库...');
    try {
        const response = await fetch('/api/style-library/rematch-prompt', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                image:'',
                analysis:{},
                current_prompt:userRequest,
                user_request:userRequest,
                camera_control:'',
                poster_copy_enabled:false,
                provider,
                model,
                ms_model: provider === 'modelscope' ? model : '',
                limit:4,
                reference_weight:65
            })
        });
        const data = await response.json().catch(() => ({}));
        if(!response.ok) throw new Error(data.detail || '匹配提示词库失败');
        const rawPrompt = String(data.prompt || data.analysis?.positive_prompt || '').trim();
        if(!rawPrompt) throw new Error('没有生成可用提示词');
        const promptBudget = smartCompressPromptToBudget(rawPrompt, SMART_MATCHED_PROMPT_BUDGET);
        const prompt = promptBudget.prompt;
        setPromptText(prompt);
        delete promptInput.dataset.preserveDraftOnce;
        const target = activeComposerNode() || selectedNode();
        if(isSmartRunnableNode(target)){
            target.promptDraftText = prompt;
            target.promptDraftHtml = escapeHtml(prompt);
            target.promptDraftTouched = true;
            target.textPromptMatched = true;
            target.textPromptMatch = {
                query:data.query || userRequest,
                cases:Array.isArray(data.cases) ? data.cases : [],
                analysis:data.analysis || {},
                model:data.model || model,
                rematchModel:model,
                source:data.source || '',
                rematched_at:Date.now()
            };
        }
        smartNotifyPromptCompression(promptBudget);
        scheduleSave();
        toast(`已匹配 ${Array.isArray(data.cases) ? data.cases.length : 0} 个提示词库案例，并替换当前输入`);
    } catch(error) {
        toast((error.message || '匹配提示词库失败').slice(0, 180));
    } finally {
        composerPromptMatching = false;
        syncComposerPromptMatchButton();
    }
}
async function runStyleMatchedPromptNode(nodeId){
    let node = nodes.find(n => n.id === nodeId);
    if(!node || node.type !== 'smart-prompt') return;
    if(node.running) return;
    pushUndo();
    node.llmEnabled = true;
    node.running = true;
    render();
    try {
        toast('正在用 GPT-5.5 重新匹配素材库...');
        const data = await rematchStylePromptForPromptNode(node);
        scheduleSave();
        render();
        toast(`已重新匹配 ${Array.isArray(data.cases) ? data.cases.length : 0} 个素材库案例，并替换当前提示词`);
    } catch(e) {
        toast((e.message || '重新匹配提示词失败').slice(0, 180));
    } finally {
        const latest = nodes.find(n => n.id === nodeId);
        if(latest) latest.running = false;
        syncRunButtonState();
        scheduleSave();
        render();
    }
}
function finishLoopTargetPreviewState(node){
    if(!node) return;
    node = liveSmartNode(node);
    markSmartNodeComplete(node);
    if((node.images || []).some(img => img?.url)){
        node.title = node.images.length > 1 ? 'Group' : 'Image';
        node.scale = node.images.length > 1 ? MEDIA_GROUP_DEFAULT_SCALE : MEDIA_NODE_DEFAULT_SCALE;
        node.outputKind = mediaKindForUrls(node.images || [], (node.images || []).some(isVideoMediaItem) ? 'video' : 'image');
        delete node.w;
        delete node.h;
    }
}
function refsForDirectLoopRound(loopNode, loopIndex, total){
    if(!loopNode?.imageInput) return [];
    return outputImagesForNode(loopNode, true, {index:loopIndex, total, nodeId:loopNode.id})
        .filter(ref => ref?.url)
        .map((ref, index) => ({
            ...ref,
            role:ref.role || `image_${index + 1}`,
            name:ref.name || trf('canvas.loopImageLabel', {n:loopIndex + index})
        }));
}
function showDirectLoopRoundPreview(loopNode, target, refs, loopIndex, total){
    if(!loopNode?.imageInput || !isSmartImageNode(target)) return false;
    const cleanRefs = (refs || []).filter(ref => ref?.url);
    if(!cleanRefs.length) return false;
    const preview = cleanRefs.map((ref, index) => stripImageGenerationMeta({
        url:ref.url || '',
        name:ref.name || trf('canvas.loopImageLabel', {n:loopIndex + index}),
        kind:ref.kind || (isVideoMediaItem(ref) ? 'video' : 'image'),
        nodeId:ref.nodeId || '',
        imageIndex:ref.imageIndex ?? '',
        loopInputPreview:true
    })).filter(ref => ref.url);
    if(!preview.length) return false;
    target.images = preview;
    target.pending = 0;
    target.running = true;
    target.runStartedAt = nowMs();
    delete target.runFinishedAt;
    delete target.runElapsedMs;
    target.runTimerHidden = false;
    target.runInputRefs = cleanRefs.map(ref => ({
        url:ref.url || '',
        name:ref.name || '',
        nodeId:ref.nodeId || '',
        imageIndex:ref.imageIndex ?? '',
        kind:ref.kind || ''
    })).filter(ref => ref.url);
    target.outputKind = mediaKindForUrls(preview, preview.some(isVideoMediaItem) ? 'video' : 'image');
    target.scale = preview.length > 1 ? MEDIA_GROUP_DEFAULT_SCALE : MEDIA_NODE_DEFAULT_SCALE;
    target.title = total > 1 ? `Image ${loopIndex}/${total}` : (target.title || 'Image');
    delete target.w;
    delete target.h;
    render();
    return true;
}
function directImageInputsFor(node){
    const upstream = smartImageUsesWorkflowInput(node) ? workflowInputNodesFor(node) : inputNodesFor(node);
    return upstream
        .filter(n => isSmartImageNode(n) && !isHistoryGroupNode(n) && (n.images || []).some(img => img?.url))
        .sort((a, b) => {
            const ax = Number(a.x) || 0, bx = Number(b.x) || 0;
            if(ax !== bx) return bx - ax;
            return (Number(a.y) || 0) - (Number(b.y) || 0);
        });
}
function directImageInputsForKinds(node, kinds=['input']){
    const upstream = upstreamNodesForKinds(node, kinds);
    return upstream
        .filter(n => isSmartImageNode(n) && !isHistoryGroupNode(n) && (n.images || []).some(img => img?.url))
        .sort((a, b) => {
            const ax = Number(a.x) || 0, bx = Number(b.x) || 0;
            if(ax !== bx) return bx - ax;
            return (Number(a.y) || 0) - (Number(b.y) || 0);
        });
}
function primaryImageInputFor(node, options={}){
    const direct = options.includeFlow
        ? directImageInputsForKinds(node, ['input', 'flow'])[0]
        : directImageInputsFor(node)[0];
    if(direct) return direct;
    const inputs = options.includeFlow ? upstreamNodesForKinds(node, ['input', 'flow']) : (smartImageUsesWorkflowInput(node) ? workflowInputNodesFor(node) : inputNodesFor(node));
    const loop = inputs.find(n => n?.type === 'smart-loop');
    if(loop?.imageInput){
        const upstream = upstreamNodesForKinds(loop, options.includeFlow ? ['input', 'flow'] : ['input']).find(n => isSmartImageNode(n) && (n.images || []).some(img => img?.url));
        if(upstream) return upstream;
    }
    return null;
}
function hasDownstreamImageNode(node){
    return downstreamNodesForId(node?.id).some(n => isSmartImageNode(n) && !isHistoryGroupNode(n));
}
function isGeneratedOutputForNode(sourceNode, targetNode){
    return Boolean(sourceNode?.id && targetNode?.sourceNodeId === sourceNode.id);
}
function downstreamWorkflowImageTargetsFor(node){
    return downstreamImageTargetsFor(node).filter(target => !isGeneratedOutputForNode(node, target));
}
function hasDownstreamWorkflowImageNode(node){
    return downstreamWorkflowImageTargetsFor(node).length > 0;
}
function smartImageChainTo(nodeId, options={}){
    const tail = nodes.find(n => n.id === nodeId);
    if(!isSmartImageNode(tail) || isHistoryGroupNode(tail)) return [];
    const chain = [];
    const seen = new Set();
    let cur = tail;
    while(cur && !seen.has(cur.id)){
        seen.add(cur.id);
        chain.unshift(cur);
        cur = primaryImageInputFor(cur, options);
    }
    return chain;
}
function upstreamNodesForId(nodeId, kinds=['input']){
    const result = [];
    const seen = new Set([nodeId]);
    const walk = id => {
        upstreamNodesForKinds(nodes.find(n => n.id === id), kinds).forEach(input => {
            if(seen.has(input.id)) return;
            seen.add(input.id);
            walk(input.id);
            result.push(input);
        });
    };
    walk(nodeId);
    return result;
}
function resolveSmartCascadeLoop(nodeId){
    const loops = upstreamNodesForId(nodeId, ['input', 'flow']).filter(n => n.type === 'smart-loop');
    if(!loops.length) return null;
    const loop = loops[loops.length - 1];
    return {node:loop, count:smartLoopCount(loop), mode:loop.mode === 'parallel' ? 'parallel' : 'serial'};
}
function relayLoopPromptNodesForEdge(sourceNode, targetNode){
    if(!sourceNode?.id || !targetNode?.id) return [];
    const directLoopIds = new Set(promptInputNodesFor(targetNode).filter(n => n?.type === 'smart-loop' && n.showPrompt).map(n => n.id));
    return inputNodesFor(sourceNode)
        .filter(n => n?.type === 'smart-loop' && n.showPrompt && !directLoopIds.has(n.id));
}
function relayLoopPromptNodesForTarget(node){
    if(!node?.id) return [];
    return inputNodesFor(node).filter(n => n?.type === 'smart-loop' && n.showPrompt);
}
function downstreamNodesForId(nodeId){
    const result = [];
    const seen = new Set([nodeId]);
    const walk = id => {
        (canvas?.connections || [])
            .filter(conn => conn.from === id && ['input','flow'].includes(conn.kind || 'flow'))
            .map(conn => nodes.find(n => n.id === conn.to))
            .filter(Boolean)
            .forEach(next => {
                if(seen.has(next.id)) return;
                seen.add(next.id);
                result.push(next);
                walk(next.id);
            });
    };
    walk(nodeId);
    return result;
}
function downstreamImageTargetsFor(node){
    if(!node?.id) return [];
    return (canvas?.connections || [])
        .filter(conn => conn.from === node.id && ['input','flow'].includes(conn.kind || 'flow'))
        .map(conn => nodes.find(n => n.id === conn.to))
        .filter(n => isSmartImageNode(n) && !isHistoryGroupNode(n))
        .sort((a, b) => {
            const ax = Number(a.x) || 0, bx = Number(b.x) || 0;
            if(ax !== bx) return ax - bx;
            return (Number(a.y) || 0) - (Number(b.y) || 0);
        });
}
function downstreamCascadeTargetsFor(node){
    if(!node?.id) return [];
    return (canvas?.connections || [])
        .filter(conn => conn.from === node.id && ['input','flow'].includes(conn.kind || 'flow'))
        .map(conn => nodes.find(n => n.id === conn.to))
        .filter(n => n && !isHistoryGroupNode(n) && (isSmartImageNode(n) || n.type === 'smart-loop'))
        .sort((a, b) => {
            const ax = Number(a.x) || 0, bx = Number(b.x) || 0;
            if(ax !== bx) return ax - bx;
            return (Number(a.y) || 0) - (Number(b.y) || 0);
        });
}
function directLoopRunTargets(loop){
    if(!loop?.id) return [];
    return downstreamImageTargetsFor(loop)
        .filter(node => !hasDownstreamWorkflowImageNode(node));
}
function smartCascadeGraphForTail(tail){
    const path = smartImageChainTo(tail?.id, {includeFlow:true}).filter(n => isSmartImageNode(n) && !isHistoryGroupNode(n));
    if(!path.length) return {root:null, path:[], edges:[], children:new Map()};
    const loop = resolveSmartCascadeLoop(tail?.id);
    const loopRoots = loop?.node?.id ? downstreamImageTargetsFor(loop.node) : [];
    const loopRoot = loopRoots.find(n => path.some(p => p.id === n.id));
    const root = loopRoot || path[0];
    const edges = [];
    const children = new Map();
    const seenEdges = new Set();
    const visiting = new Set();
    const walk = node => {
        if(!node?.id || visiting.has(node.id)) return;
        visiting.add(node.id);
        const targets = downstreamCascadeTargetsFor(node);
        children.set(node.id, targets);
        targets.forEach(target => {
            const key = `${node.id}->${target.id}`;
            if(!seenEdges.has(key)){
                seenEdges.add(key);
                edges.push({source:node, target, key});
            }
            walk(target);
        });
        visiting.delete(node.id);
    };
    walk(root);
    return {root, path, edges, children};
}
function cascadeTailForLoop(loopId){
    const loop = nodes.find(n => n.id === loopId && n.type === 'smart-loop');
    const directTargets = directLoopRunTargets(loop);
    if(directTargets.length) return directTargets[directTargets.length - 1];
    const directImages = downstreamImageTargetsFor({id:loopId});
    const directIds = new Set(directImages.map(n => n.id));
    const candidates = downstreamNodesForId(loopId)
        .filter(n => isSmartImageNode(n))
        .filter(n => !isHistoryGroupNode(n))
        .filter(n => canRunSmartCascade(n));
    if(!candidates.length) return null;
    return candidates.sort((a, b) => {
        const ad = directIds.has(a.id) ? 1 : 0;
        const bd = directIds.has(b.id) ? 1 : 0;
        if(ad !== bd) return ad - bd;
        const ax = Number(a.x) || 0, bx = Number(b.x) || 0;
        if(ax !== bx) return bx - ax;
        return (Number(b.y) || 0) - (Number(a.y) || 0);
    })[0];
}
function canRunSmartCascade(node){
    if(!isSmartImageNode(node) || isHistoryGroupNode(node)) return false;
    const graph = smartCascadeGraphForTail(node);
    const loop = resolveSmartCascadeLoop(node.id);
    if(loop && isDirectLoopTargetRun(loop, node, graph)) return true;
    if(hasDownstreamImageNode(node)) return false;
    if(graph.edges.length) return true;
    return Boolean(loop);
}
function isDirectLoopTargetRun(loop, tail, graph){
    if(!loop?.node?.id || !tail?.id) return false;
    if(graph?.root?.id !== tail.id) return false;
    if(hasDownstreamWorkflowImageNode(tail)) return false;
    return downstreamImageTargetsFor(loop.node).some(node => node.id === tail.id);
}
function cascadeConnectionKeys(){
    const keys = new Set();
    const addKey = (from, to) => {
        if(from && to) keys.add(`${from}->${to}`);
    };
    const activeLoopIds = new Set(smartCascadeRuns.keys());
    const loops = activeLoopIds.size
        ? nodes.filter(n => n?.type === 'smart-loop' && activeLoopIds.has(n.id))
        : nodes.filter(n => n?.type === 'smart-loop');
    loops.forEach(loop => {
        const tail = cascadeTailForLoop(loop.id);
        if(!tail) return;
        const graph = smartCascadeGraphForTail(tail);
        if(!graph.root) return;
        const chainIds = new Set(graph.path.map(n => n.id));
        graph.edges.forEach(edge => addKey(edge.source.id, edge.target.id));
        (canvas?.connections || []).forEach(conn => {
            if((conn.kind || 'flow') === 'history') return;
            const toNode = nodes.find(n => n.id === conn.to);
            if(conn.from === loop.id && (chainIds.has(conn.to) || downstreamNodesForId(conn.to).some(n => chainIds.has(n.id)))) addKey(conn.from, conn.to);
            if(toNode && chainIds.has(toNode.id)){
                inputNodesFor(toNode).filter(n => n?.type === 'smart-loop' && n.showPrompt).forEach(inputLoop => addKey(inputLoop.id, toNode.id));
            }
        });
    });
    return keys;
}
function coolRunButton(ms=2000){
    if(!runBtn) return 0;
    const token = ++runBtnCooldownToken;
    syncRunButtonState();
    setTimeout(() => {
        if(token === runBtnCooldownToken) syncRunButtonState();
    }, ms);
    return token;
}
function coolNodeRunningState(node, ms=2000){
    if(!node) return 0;
    const token = ++smartRunStateToken;
    smartNodeRunTokens.set(node.id, token);
    node.running = true;
    setTimeout(() => {
        if(smartNodeRunTokens.get(node.id) !== token) return;
        smartNodeRunTokens.delete(node.id);
        const current = nodes.find(n => n.id === node.id);
        if(current){
            current.running = false;
            render();
        }
    }, ms);
    return token;
}
function clearNodeRunningState(node){
    if(!node) return;
    smartNodeRunTokens.delete(node.id);
    node.running = false;
}
function pushRightSideNodes(sourceNode, delta){
    const shift = Math.ceil(Number(delta) || 0);
    if(!sourceNode || shift <= 0) return;
    const sourceRight = (Number(sourceNode.x) || 0) + nodeRect(sourceNode).width - shift;
    const downstreamIds = new Set(downstreamNodesForId(sourceNode.id).map(n => n.id));
    nodes.forEach(n => {
        if(!n || n.id === sourceNode.id) return;
        const r = nodeRect(n);
        const shouldShift = downstreamIds.has(n.id) || (Number(r.x) > sourceRight && Math.abs((Number(r.y) || 0) - (Number(sourceNode.y) || 0)) < 520);
        if(shouldShift) n.x = (Number(n.x) || 0) + shift;
    });
}
function cascadeOutputTitle(kind='image', count=1){
    if(Number(count) > 1) return kind === 'video' ? 'Videos' : kind === 'audio' ? 'Audios' : kind === 'text' ? 'Texts' : 'Group';
    return kind === 'video' ? 'Video' : kind === 'audio' ? 'Audio' : kind === 'text' ? 'Text' : kind === 'file' ? 'File' : 'Image';
}
function nonPreviewOutputImages(images=[]){
    return (images || []).filter(img => img?.url && !img.loopInputPreview);
}
function cleanHistoryImages(images=[]){
    const seen = new Set();
    return nonPreviewOutputImages(images)
        .map(img => stripImageGenerationMeta({...img}))
        .filter(img => {
            const key = `${img.kind || ''}|${img.url || ''}`;
            if(seen.has(key)) return false;
            seen.add(key);
            return true;
        });
}
function hasHistoryConnection(nodeId, groupId){
    return Boolean(nodeId && groupId && (canvas?.connections || []).some(conn => conn.from === nodeId && conn.to === groupId && (conn.kind || 'flow') === 'history'));
}
function demoteHistoryGroupNode(group){
    if(!group) return;
    delete group.historyFor;
    delete group.isHistoryGroup;
    if(group.title === '历史分组'){
        const count = (group.images || []).length;
        group.title = count > 1 ? 'Group' : count === 1 ? 'Image' : tr('smart.createImportNode');
    }
}
function historyGroupForNode(node){
    if(!node?.id) return null;
    let matched = null;
    nodes.forEach(n => {
        if(!isHistoryGroupNode(n) || n.historyFor !== node.id) return;
        if(hasHistoryConnection(node.id, n.id)){
            if(!matched) matched = n;
        } else {
            demoteHistoryGroupNode(n);
        }
    });
    return matched;
}
function positionHistoryGroupForNode(node, group){
    if(!node || !group) return;
    const r = nodeRect(node);
    const gr = nodeRect(group);
    if(!Number.isFinite(Number(group.x))) group.x = Math.round((Number(node.x) || 0) + Math.max(0, (r.width - gr.width) / 2));
    if(!Number.isFinite(Number(group.y))) group.y = Math.round((Number(node.y) || 0) + r.height + 56);
}
function ensureHistoryGroupForNode(node){
    if(!node?.id) return null;
    let group = historyGroupForNode(node);
    if(!group){
        const r = nodeRect(node);
        group = {
            id:uid('smart'),
            type:'smart-image',
            x:Math.round(Number(node.x || 0)),
            y:Math.round(Number(node.y || 0) + r.height + 56),
            title:'历史分组',
            images:[],
            historyFor:node.id,
            isHistoryGroup:true,
            scale:MEDIA_GROUP_DEFAULT_SCALE,
            created_at:Date.now()
        };
        nodes.push(group);
    }
    group.type = 'smart-image';
    group.title = '历史分组';
    group.isHistoryGroup = true;
    group.historyFor = node.id;
    if(!Number.isFinite(Number(group.scale))) group.scale = MEDIA_GROUP_DEFAULT_SCALE;
    addConnection(node.id, group.id, 'history');
    positionHistoryGroupForNode(node, group);
    return group;
}
function replaceOutputsToNodeWithHistory(node, additions, kind='image', meta=null, options={}){
    if(!node || !additions?.length) return [];
    node = liveSmartNode(node);
    const beforeRight = (Number(node.x) || 0) + nodeRect(node).width;
    const existing = cleanHistoryImages(node.images || []);
    const next = cleanHistoryImages(additions);
    if(!next.length) return [];
    const keepOnlyLatest = options.keepOnlyLatest !== false && Boolean(node.autoBranchOutputSourceId);
    if(keepOnlyLatest) removeHistoryGroupForNode(node);
    if(!keepOnlyLatest){
        const history = existing.length ? ensureHistoryGroupForNode(node) : historyGroupForNode(node);
        if(history){
            const archived = cleanHistoryImages([...existing, ...(history.images || [])]);
            history.images = archived;
        history.title = '历史分组';
            history.outputKind = kind;
            history.scale = MEDIA_GROUP_DEFAULT_SCALE;
            delete history.w;
            delete history.h;
        }
    }
    node.images = next;
    markSmartNodeComplete(node, meta);
    node.outputKind = kind;
    node.title = cascadeOutputTitle(kind, node.images.length);
    node.scale = node.images.length > 1 ? MEDIA_GROUP_DEFAULT_SCALE : MEDIA_NODE_DEFAULT_SCALE;
    clearSmartNodeExplicitSize(node);
    if(meta) attachRunMeta(node, meta);
    const afterRight = (Number(node.x) || 0) + nodeRect(node).width;
    const skipShift = options.skipShift || Boolean(smartLoopContext?.nodeId);
    if(!skipShift) pushRightSideNodes(node, afterRight - beforeRight + 36);
    selectedImage = {nodeId:'', index:-1};
    return next;
}
function appendOutputsToNode(node, additions, kind='image', options={}){
    if(!node || !additions?.length) return [];
    node = liveSmartNode(node);
    const beforeRight = (Number(node.x) || 0) + nodeRect(node).width;
    const existing = nonPreviewOutputImages(node.images).map(img => stripImageGenerationMeta({...img}));
    const next = additions.map(img => stripImageGenerationMeta({...img}));
    node.images = [...existing, ...next];
    markSmartNodeComplete(node);
    node.outputKind = kind;
    node.title = node.images.length > 1 ? (kind === 'video' ? 'Videos' : kind === 'audio' ? 'Audios' : kind === 'text' ? 'Texts' : 'Group') : (kind === 'video' ? 'Video' : kind === 'audio' ? 'Audio' : kind === 'text' ? 'Text' : kind === 'file' ? 'File' : 'Image');
    clearSmartNodeExplicitSize(node);
    const afterRight = (Number(node.x) || 0) + nodeRect(node).width;
    const skipShift = options.skipShift || Boolean(smartLoopContext?.nodeId);
    if(!skipShift) pushRightSideNodes(node, afterRight - beforeRight + 36);
    return next;
}
function appendLoopOutputsToNode(node, additions, kind='image', ctx=smartLoopContext){
    if(!node || !additions?.length) return [];
    const runState = ctx?.runState;
    if(runState && !runState.loopAppendInitialized) runState.loopAppendInitialized = new Set();
    const initialized = runState?.loopAppendInitialized;
    if(initialized && !initialized.has(node.id)){
        initialized.add(node.id);
        const existing = cleanHistoryImages(node.images || []);
        if(existing.length){
            const history = ensureHistoryGroupForNode(node);
            history.images = cleanHistoryImages([...existing, ...(history.images || [])]);
            history.title = '历史分组';
            history.outputKind = kind;
            history.scale = MEDIA_GROUP_DEFAULT_SCALE;
            delete history.w;
            delete history.h;
        }
        node.images = [];
    }
    return appendOutputsToNode(node, additions, kind, {skipShift:true});
}
function syncCascadeRunButton(node=selectedNode()){
    if(!cascadeRunBtn) return;
    const visible = canRunSmartCascade(node);
    cascadeRunBtn.style.display = visible ? 'inline-flex' : 'none';
    const nodeLoopId = resolveSmartCascadeLoop(node?.id)?.node?.id || '';
    const loopRunState = smartCascadeRunForLoop(nodeLoopId);
    const runningForNode = Boolean(loopRunState);
    cascadeRunBtn.disabled = !visible || (!runningForNode && Boolean(node?.running)) || Boolean(loopRunState?.stopRequested);
    cascadeRunBtn.classList.toggle('is-stop', runningForNode);
    cascadeRunBtn.innerHTML = runningForNode
        ? `<i data-lucide="square"></i><span>${escapeHtml(smartCascadeStopText(Boolean(loopRunState?.stopRequested)))}</span>`
        : `<i data-lucide="workflow"></i><span>${escapeHtml(tr('smart.loopRunAll'))}</span>`;
    refreshIcons();
}
function loadNodePromptDraftToInput(node){
    if(node?.promptDraftHtml) {
        const hasToken = String(node.promptDraftHtml || '').includes('mention-image-token');
        promptInput.innerHTML = hasToken
            ? node.promptDraftHtml
            : (promptHtmlWithMentionTokens(node.runPrompt || node.promptDraftText || '', node.runPromptRefs || []) || node.promptDraftHtml);
    } else {
        const rebuilt = promptHtmlWithMentionTokens(node?.runPrompt || '', node?.runPromptRefs || []);
        if(rebuilt) promptInput.innerHTML = rebuilt;
        else setPromptText(node?.runPrompt || '');
    }
}
function buildPromptRequestForNode(node, defaultImages, ctx=smartLoopContext){
    const oldHtml = promptInput.innerHTML;
    loadNodePromptDraftToInput(node);
    try {
        return buildPromptRequest(node, defaultImages, false, ctx);
    } finally {
        promptInput.innerHTML = oldHtml;
    }
}
async function generateUrlsForCurrentSettings(node, prompt, refs, runSettings=settings){
    const activeSettings = runSettings || settings;
    if(isApiLikeEngine(activeSettings.engine) && activeSettings.apiKind === 'video'){
        return {urls:await runApiVideoGeneration(prompt, refs, activeSettings), kind:'video'};
    }
    if(isApiLikeEngine(activeSettings.engine)){
        const taskResult = await runApiGeneration(prompt, refs, activeSettings);
        const taskIds = Array.isArray(taskResult?.taskIds) ? taskResult.taskIds : [];
        if(taskIds.length){
            const settled = await Promise.all(taskIds.map(taskId => pollSmartCanvasTask(taskId)));
            const urls = settled.flatMap(result => resultMediaUrls(result?.images || result)).filter(Boolean);
            return {urls, kind:mediaKindForUrls(urls, 'image')};
        }
        const urls = resultMediaUrls(taskResult);
        return {urls, kind:mediaKindForUrls(urls, 'image')};
    }
    const urls = activeSettings.engine === 'modelscope'
        ? await runModelscopeGeneration(prompt, refs, activeSettings)
        : [];
    return {urls, kind:mediaKindForUrls(urls, 'image')};
}
async function runCascadeStepIntoNode(sourceNode, targetNode, inputRefs, ctx=smartLoopContext){
    const outputNode = targetNode || sourceNode;
    if(!sourceNode || !targetNode || !outputNode) return [];
    const requestNode = (sourceNode?.type === 'smart-loop' || sourceNode?.type === 'smart-prompt') ? targetNode : sourceNode;
    const previousSettings = cloneSmartSettings(settings);
    const runSettings = {...cloneSmartSettings(settings), ...cloneSmartSettings(smartSettingsForNode(requestNode) || {})};
    settings = runSettings;
    const outpaintSize = validOutpaintSize(requestNode);
    const selfRefs = sourceNode?.type === 'smart-loop' ? [] : selfReferenceImagesForNode(sourceNode, false, ctx).filter(img => img?.url);
    const sourceRefs = (selfRefs.length ? selfRefs : defaultReferenceImagesFor(requestNode, false, ctx)).filter(img => img?.url);
    const refsForRequest = sourceRefs.length
        ? sourceRefs
        : (inputRefs && inputRefs.length ? inputRefs : null);
    const request = buildPromptRequestForNode(
        requestNode,
        refsForRequest,
        ctx
    );
    const prompt = (request.prompt || '').trim();
    const displayPrompt = (request.displayPrompt || '').trim();
    if((!prompt || !displayPrompt) && smartRunNeedsPrompt(runSettings)){
        settings = previousSettings;
        throw new Error('链路节点缺少提示词');
    }
    smartValidateReferenceRequest(requestNode, prompt, request.refs || []);
    const meta = {
        prompt,
        displayPrompt:request.displayPrompt || '',
        promptRefs:(request.refs || []).map(ref => ({url:ref.url || '', name:ref.name || '', nodeId:ref.nodeId || '', imageIndex:ref.imageIndex ?? ''})).filter(ref => ref.url),
        inputRefs:(request.refs || []).map(ref => ({url:ref.url || '', name:ref.name || '', nodeId:ref.nodeId || '', imageIndex:ref.imageIndex ?? '', kind:ref.kind || ''})).filter(ref => ref.url),
        sourceNodeId:sourceNode.id,
        settings:JSON.parse(JSON.stringify(runSettings)),
        createdAt:Date.now()
    };
    if(requestNode.promptDraftHtml != null){
        meta.promptHtml = requestNode.promptDraftHtml;
        meta.promptText = requestNode.promptDraftText || request.displayPrompt || '';
    }
    const logKind = isApiLikeEngine(runSettings.engine) && runSettings.apiKind === 'video' ? 'video' : 'image';
    const runLog = smartRunSnapshot(requestNode, prompt, request.refs || [], logKind);
    const runLogStart = nowMs();
    const targetPromptState = {
        promptDraftHtml:targetNode.promptDraftHtml,
        promptDraftText:targetNode.promptDraftText,
        runPrompt:targetNode.runPrompt,
        runModelPrompt:targetNode.runModelPrompt,
        runPromptRefs:targetNode.runPromptRefs ? targetNode.runPromptRefs.map(ref => ({...ref})) : undefined,
        runInputRefs:targetNode.runInputRefs ? targetNode.runInputRefs.map(ref => ({...ref})) : undefined,
        runSettings:targetNode.runSettings ? cloneSmartSettings(targetNode.runSettings) : undefined,
        sourceNodeId:targetNode.sourceNodeId,
        runAt:targetNode.runAt
    };
    outputNode.running = true;
    outputNode.runStartedAt = nowMs();
    delete outputNode.runFinishedAt;
    delete outputNode.runElapsedMs;
    outputNode.runTimerHidden = false;
    rememberRecentSmartSettings(runSettings, requestNode);
    render();
    settings = previousSettings;
    try {
        const result = await generateUrlsForCurrentSettings(outputNode, prompt, request.refs || [], runSettings);
        if(!result.urls?.length) throw new Error(result.kind === 'video' ? tr('smart.errNoOutVideos') : tr('smart.errNoOutImages'));
        if(outpaintSize) delete requestNode.outpaintSize;
        addSmartGenerationLog({run:{...runLog, kind:result.kind || logKind}, outputs:result.urls, runMs:nowMs() - runLogStart});
        const ext = result.kind === 'video' ? 'mp4' : result.kind === 'audio' ? 'mp3' : result.kind === 'text' ? 'txt' : 'png';
        const additions = result.urls.map((item, i) => {
            const url = typeof item === 'string' ? item : item?.url || '';
            return stripImageGenerationMeta(copyMediaSizeFields(item, {url, name:(typeof item === 'object' && item.name) || `output-${i + 1}.${ext}`, kind:(typeof item === 'object' && item.kind) || result.kind, generatedResult:true}));
        }).filter(item => item.url);
        if(ctx?.appendLoopOutputs) {
            appendLoopOutputsToNode(outputNode, additions, result.kind, ctx);
        } else {
            replaceOutputsToNodeWithHistory(outputNode, additions, result.kind, null, {skipShift:Boolean(ctx?.nodeId)});
        }
        outputNode.runPrompt = targetPromptState.runPrompt;
        outputNode.runModelPrompt = targetPromptState.runModelPrompt;
        outputNode.runPromptRefs = targetPromptState.runPromptRefs || [];
        outputNode.runInputRefs = targetPromptState.runInputRefs || [];
        outputNode.runSettings = targetPromptState.runSettings;
        outputNode.sourceNodeId = targetPromptState.sourceNodeId;
        outputNode.runAt = targetPromptState.runAt;
        if(targetPromptState.promptDraftHtml === undefined) delete outputNode.promptDraftHtml;
        else outputNode.promptDraftHtml = targetPromptState.promptDraftHtml;
        if(targetPromptState.promptDraftText === undefined) delete outputNode.promptDraftText;
        else outputNode.promptDraftText = targetPromptState.promptDraftText;
        ['runPrompt','runModelPrompt','runSettings','sourceNodeId','runAt'].forEach(key => {
            if(targetPromptState[key] === undefined) delete outputNode[key];
        });
        settings = previousSettings;
        render();
        return rememberRoundOutputs(ctx, outputNode, additions);
    } catch(e) {
        settings = previousSettings;
        if(handleJimengPendingSignal(outputNode, e)){
            render();
            return [];
        }
        outputNode.running = false;
        addSmartGenerationLog({run:runLog, outputs:[], runMs:nowMs() - runLogStart, error:e.message || String(e)});
        render();
        throw e;
    }
}
async function runLoopRoundIntoSlot(loopNode, rootNode, outputSlot, loopIndex, ctx){
    if(!loopNode || !rootNode || !outputSlot) return [];
    outputSlot = liveSmartNode(outputSlot);
    const previousSettings = cloneSmartSettings(settings);
    const edgeKey = `${rootNode.id}->${outputSlot.id}`;
    const runSettings = {...cloneSmartSettings(settings), ...cloneSmartSettings(smartSettingsForNode(rootNode) || {})};
    settings = runSettings;
    try {
        const refsForRequest = outputImagesForNode(loopNode, true, ctx).filter(img => img?.url);
        const request = buildPromptRequestForNode(rootNode, refsForRequest.length ? refsForRequest : null, ctx);
        const prompt = (request.prompt || '').trim();
        const displayPrompt = (request.displayPrompt || '').trim();
        if((!prompt || !displayPrompt) && smartRunNeedsPrompt(runSettings)) throw new Error('链路节点缺少提示词');
        const meta = {
            prompt,
            displayPrompt:request.displayPrompt || '',
            promptRefs:(request.refs || []).map(ref => ({url:ref.url || '', name:ref.name || '', nodeId:ref.nodeId || '', imageIndex:ref.imageIndex ?? ''})).filter(ref => ref.url),
            inputRefs:(request.refs || []).map(ref => ({url:ref.url || '', name:ref.name || '', nodeId:ref.nodeId || '', imageIndex:ref.imageIndex ?? '', kind:ref.kind || ''})).filter(ref => ref.url),
            sourceNodeId:rootNode.id,
            settings:JSON.parse(JSON.stringify(runSettings)),
            createdAt:Date.now()
        };
        const logKind = isApiLikeEngine(runSettings.engine) && runSettings.apiKind === 'video' ? 'video' : 'image';
        const runLog = smartRunSnapshot(rootNode, prompt, request.refs || [], logKind);
        const runLogStart = nowMs();
        const expectedCount = isApiLikeEngine(runSettings.engine) && runSettings.apiKind !== 'video'
            ? Math.max(1, Math.min(8, Number(runSettings.count || 1)))
            : 1;
        outputSlot.queued = false;
        outputSlot.running = true;
        outputSlot.pending = expectedCount;
        outputSlot.runStartedAt = nowMs();
        delete outputSlot.runFinishedAt;
        delete outputSlot.runElapsedMs;
        outputSlot.runTimerHidden = false;
        const runPath = smartCascadePathForCtx(ctx);
        if(runPath?.states) {
            runPath.states[edgeKey] = 'active';
            scheduleConnectionLayerRefresh();
        }
        render();
        settings = previousSettings;
        let result;
        if(isApiLikeEngine(runSettings.engine) && runSettings.apiKind !== 'video'){
            const taskResult = await runApiGeneration(prompt, request.refs || [], runSettings);
            const taskIds = Array.isArray(taskResult?.taskIds) ? taskResult.taskIds : [];
            if(!taskIds.length) throw new Error(tr('smart.errRunFailed'));
            const existing = cleanHistoryImages(outputSlot.images || []);
            if(existing.length){
                const history = ensureHistoryGroupForNode(outputSlot);
                history.images = cleanHistoryImages([...existing, ...(history.images || [])]);
                history.title = '历史分组';
                history.outputKind = 'image';
                history.scale = MEDIA_GROUP_DEFAULT_SCALE;
                delete history.w;
                delete history.h;
                outputSlot.images = [];
            }
            outputSlot.pendingTasks = taskIds.map(taskId => ({taskId, kind:'image', providerId:taskResult.providerId, model:taskResult.model}));
            outputSlot.pending = Math.max(taskIds.length, Number(outputSlot.pending || 0) || taskIds.length);
            outputSlot.running = false;
            render();
            scheduleSave();
            await saveCanvas();
            await resumeSmartPendingNode(outputSlot);
            if(outputSlot.jimengPending || smartRecoverableImageTask(outputSlot)){
                outputSlot.queued = false;
                return [];
            }
            result = {urls:(outputSlot.images || []).map(img => img?.url ? img : null).filter(Boolean), kind:'image'};
        } else {
            result = await generateUrlsForCurrentSettings(outputSlot, prompt, request.refs || [], runSettings);
        }
        if(!result.urls?.length) throw new Error(result.kind === 'video' ? tr('smart.errNoOutVideos') : tr('smart.errNoOutImages'));
        let additions;
        if(isApiLikeEngine(runSettings.engine) && runSettings.apiKind !== 'video'){
            additions = (outputSlot.images || []).map(img => stripImageGenerationMeta({...img})).filter(img => img?.url);
            if(meta) attachRunMeta(outputSlot, meta);
        } else {
            const ext = result.kind === 'video' ? 'mp4' : result.kind === 'audio' ? 'mp3' : result.kind === 'text' ? 'txt' : 'png';
            additions = result.urls.map((item, i) => {
                const url = typeof item === 'string' ? item : item?.url || '';
                return stripImageGenerationMeta(copyMediaSizeFields(item, {url, name:(typeof item === 'object' && item.name) || `output-${i + 1}.${ext}`, kind:(typeof item === 'object' && item.kind) || result.kind, generatedResult:true}));
            }).filter(item => item.url);
            outputSlot = liveSmartNode(outputSlot);
            outputSlot.images = nonPreviewOutputImages(outputSlot.images);
            replaceOutputsToNodeWithHistory(outputSlot, additions, result.kind, meta, {skipShift:Boolean(ctx?.nodeId)});
        }
        outputSlot = liveSmartNode(outputSlot);
        markSmartNodeComplete(outputSlot, meta);
        clearSourceBusyStateIfDownstreamDone(rootNode);
        if(runPath?.states) {
            runPath.states[edgeKey] = 'done';
            scheduleConnectionLayerRefresh();
        }
        addSmartGenerationLog({run:{...runLog, kind:result.kind || logKind}, outputs:result.urls, runMs:nowMs() - runLogStart});
        return rememberRoundOutputs(ctx, outputSlot, additions);
    } catch(e) {
        if(handleJimengPendingSignal(outputSlot, e)){
            outputSlot.queued = false;
            return [];
        }
        outputSlot.queued = false;
        outputSlot.pending = 0;
        outputSlot.running = false;
        throw e;
    } finally {
        settings = previousSettings;
    }
}
function appendCascadeRefsToReceiver(node, refs, ctx=smartLoopContext){
    if(!node || !refs?.length) return [];
    const additions = refs
        .filter(ref => ref?.url)
        .map((ref, i) => stripImageGenerationMeta({
            url:ref.url,
            name:ref.name || `output-${i + 1}.png`,
            kind:ref.kind || (isVideoMediaItem(ref) ? 'video' : 'image')
        }));
    if(!additions.length) return [];
    replaceOutputsToNodeWithHistory(node, additions, mediaKindForUrls(additions, additions.some(isVideoMediaItem) ? 'video' : 'image'), null, {skipShift:Boolean(ctx?.nodeId)});
    render();
    return rememberRoundOutputs(ctx, node, additions);
}
function cascadeRefsFromOutputs(outputs, targetNode){
    return (outputs || []).filter(img => img?.url).map((img, index) => ({
        url:img.url,
        name:img.name || `图${index + 1}`,
        kind:img.kind || 'image',
        role:`image_${index + 1}`,
        nodeId:targetNode?.id || '',
        imageIndex:targetNode ? (targetNode.images || []).length - outputs.length + index : index
    }));
}
function smartCascadeStopText(stopping=false){
    return stopping ? '停止中...' : '停止运行';
}
function smartCascadeAbortError(){
    const err = new Error('已停止一键运行');
    err.smartCascadeStopped = true;
    return err;
}
function throwIfSmartCascadeStopRequested(runState=null){
    if(runState?.stopRequested || (!runState && smartCascadeStopRequested)) throw smartCascadeAbortError();
}
function requestSmartCascadeStop(loopId=''){
    const runState = loopId ? smartCascadeRunForLoop(loopId) : (smartCascadeRuns.get(smartCascadeActiveLoopId) || [...smartCascadeRuns.values()][0] || null);
    if(runState){
        if(runState.stopRequested) return;
        runState.stopRequested = true;
        syncSmartCascadeLegacyState(runState.runKey || runState.loopId || loopId);
    } else {
        if(!smartCascadeRunning || smartCascadeStopRequested) return;
        smartCascadeStopRequested = true;
    }
    toast('已请求停止，当前任务完成后停止');
    render();
}
function smartCascadeParallelLimit(chain=[]){
    return 6;
}
async function runSmartCascadeRoundsWithLimit(roundIndexes, limit, runner, runState=null){
    let next = 0;
    const workerCount = Math.max(1, Math.min(Number(limit) || 1, roundIndexes.length));
    const workers = Array.from({length:workerCount}, async () => {
        while(next < roundIndexes.length){
            if(runState?.stopRequested || (!runState && smartCascadeStopRequested)) break;
            const roundOffset = next++;
            const current = roundIndexes[roundOffset];
            try {
                await runner(current, roundOffset);
            } catch(e) {
                if(e?.smartCascadeStopped) break;
                throw e;
            }
        }
    });
    await Promise.all(workers);
}
async function runSmartCascade(targetNode=null){
    const tail = targetNode || selectedNode();
    if(!canRunSmartCascade(tail)){ toast('请选择链路结尾图片节点'); return; }
    savePromptDraftForCurrent();
    const graph = smartCascadeGraphForTail(tail);
    const chain = graph.path;
    const loop = resolveSmartCascadeLoop(tail.id);
    const loopId = loop?.node?.id || '';
    if(loopId && smartCascadeIsLoopRunning(loopId)){ requestSmartCascadeStop(loopId); return; }
    if(!loopId && smartCascadeAnyRunning()){ requestSmartCascadeStop(); return; }
    const directLoopTargetRun = Boolean(loop && isDirectLoopTargetRun(loop, tail, graph));
    const singleNodeLoopRun = Boolean(loop && (chain.length === 1 || directLoopTargetRun));
    if(!graph.edges.length && !singleNodeLoopRun){ toast(tr('smart.loopNoChain')); return; }
    const originalSelected = selectedId;
    const originalSettings = cloneSmartSettings(settings);
    const originalPromptHtml = promptInput.innerHTML;
    const runKey = loopId || `cascade-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const runState = {runKey, loopId, stopRequested:false, runPath:null};
    smartCascadeRuns.set(runKey, runState);
    syncSmartCascadeLegacyState(runKey);
    smartCascadeSilentSelection = true;
    runBtn.disabled = true;
    if(cascadeRunBtn) cascadeRunBtn.disabled = false;
    pushUndo();
    const totalRounds = loop?.count || 1;
    const startIndex = Math.max(1, Number(loop?.node?.loopStart) || 1);
    const batchSize = loop?.node?.imageInput ? Math.max(1, Math.min(100, Number(loop.node.imageBatchSize) || 1)) : 1;
    const endIndex = startIndex + (totalRounds - 1) * batchSize;
    const loopMode = loop?.mode === 'parallel' ? 'parallel' : 'serial';
    const parallelLimit = loopMode === 'parallel' && totalRounds > 1 ? smartCascadeParallelLimit(chain) : 1;
    const precreateSingleSlots = singleNodeLoopRun && loopMode === 'parallel' && totalRounds > 1 && parallelLimit > 1;
    let singleLoopSlots = [];
    if(singleNodeLoopRun){
        runState.runPath = {states:{}};
        smartCascadeRunPath = runState.runPath;
    }
    if(singleNodeLoopRun){
        singleLoopSlots = Array.from({length:totalRounds}, (_, round) => {
            const loopIndex = startIndex + round * batchSize;
            const slot = loopOutputSlotForRound(tail, loop.node, loopIndex, round);
            return slot ? tagLoopOutputSlot(slot, tail, loop.node, loopIndex, round) : null;
        });
        singleLoopSlots.filter(Boolean).forEach(slot => { runState.runPath.states[`${tail.id}->${slot.id}`] = 'wait'; });
        if(precreateSingleSlots){
            for(let slotOffset = 0; slotOffset < totalRounds; slotOffset++){
                if(singleLoopSlots[slotOffset]) continue;
                const loopIndex = startIndex + slotOffset * batchSize;
                singleLoopSlots[slotOffset] = createLoopOutputSlot(tail, loopIndex, slotOffset, {queued:true, loopNode:loop.node, slotIndex:slotOffset, runState});
            }
        }
        render();
    }
    if(!singleNodeLoopRun){
        const runStates = {};
        if(loop?.node?.id && graph.root?.id) runStates[`${loop.node.id}->${graph.root.id}`] = 'wait';
        graph.edges.forEach(edge => { runStates[edge.key] = 'wait'; });
        runState.runPath = {states:runStates};
        smartCascadeRunPath = runState.runPath;
        scheduleConnectionLayerRefresh();
        updateComposer();
    }
    try {
        const runRound = async (loopIndex=startIndex, options={}) => {
            throwIfSmartCascadeStopRequested(runState);
            const ctx = loop
                ? {index:loopIndex, total:endIndex, nodeId:loop.node.id, forceWorkflow:chain.length > 1 && !singleNodeLoopRun, runState, roundOutputs:new Map()}
                : {runState, roundOutputs:new Map()};
            if(parallelLimit === 1) smartLoopContext = ctx;
            if(singleNodeLoopRun){
                const refs = refsForDirectLoopRound(loop.node, loopIndex, endIndex);
                if(directLoopTargetRun && parallelLimit === 1) showDirectLoopRoundPreview(loop.node, tail, refs, loopIndex, endIndex);
                const slotIndex = Math.max(0, Math.floor((loopIndex - startIndex) / batchSize));
                const outputTarget = tagLoopOutputSlot(
                    options.outputTarget || singleLoopSlots[slotIndex] || loopOutputSlotForRound(tail, loop.node, loopIndex, slotIndex) || createLoopOutputSlot(tail, loopIndex, slotIndex, {loopNode:loop.node, slotIndex, runState}),
                    tail,
                    loop.node,
                    loopIndex,
                    slotIndex
                );
                singleLoopSlots[slotIndex] = outputTarget;
                await runLoopRoundIntoSlot(loop.node, tail, outputTarget, loopIndex, ctx);
                return;
            }
            const producedRefs = new Map();
            const runBranch = async (source, incomingRefs=[]) => {
                throwIfSmartCascadeStopRequested(runState);
                let targets = graph.children.get(source.id) || [];
                const loopPrompts = isSmartImageNode(source) ? upstreamLoopPromptNodesFor(source) : [];
                const sourceLoopPrompts = isSmartImageNode(source) ? relayLoopPromptNodesForTarget(source) : [];
                if(runState.runPath && sourceLoopPrompts.length && source?.id){
                    sourceLoopPrompts.forEach(loopNode => {
                        runState.runPath.states[`${loopNode.id}->${source.id}`] = 'done';
                    });
                    scheduleConnectionLayerRefresh();
                }
                if(loopPrompts.length && targets.length > 1){
                    const firstLoop = loopPrompts[0];
                    const startBase = Math.max(1, Number(firstLoop.loopStart) || 1);
                    const currentIndex = Math.max(1, Number(ctx?.index || startBase) || startBase);
                    const selectedTarget = targets[(currentIndex - 1) % targets.length];
                    if(runState.runPath && firstLoop?.id && source?.id){
                        runState.runPath.states[`${firstLoop.id}->${source.id}`] = 'done';
                        scheduleConnectionLayerRefresh();
                    }
                    targets = [selectedTarget].filter(Boolean);
                }
                let sharedRefs = incomingRefs;
                for(let index = 0; index < targets.length; index++){
                    throwIfSmartCascadeStopRequested(runState);
                    const target = targets[index];
                    const edgeKey = `${source.id}->${target.id}`;
                    let outputs = [];
                    const targetChildren = (graph.children.get(target.id) || []).filter(child => child && child.type !== 'smart-loop');
                    const targetIsLeaf = target.type !== 'smart-loop' && targetChildren.length === 0;
                    const relayLoops = isSmartImageNode(source) && isSmartImageNode(target)
                        ? relayLoopPromptNodesForEdge(source, target)
                        : [];
                    const stepCtx = relayLoops.length && isSmartImageNode(target)
                        ? {...(ctx || {}), appendLoopOutputs:Boolean(ctx?.nodeId && targetIsLeaf), relayPromptNodeIds:[...new Set([...(ctx?.relayPromptNodeIds || []), ...relayLoops.map(n => n.id)])]}
                        : {...(ctx || {}), appendLoopOutputs:Boolean(ctx?.nodeId && targetIsLeaf)};
                    try {
                        if(runState.runPath && relayLoops.length && source?.id && isSmartImageNode(target)){
                            relayLoops.forEach(loopNode => {
                                runState.runPath.states[`${loopNode.id}->${source.id}`] = 'done';
                            });
                            scheduleConnectionLayerRefresh();
                        }
                        if(runState.runPath){
                            runState.runPath.states[edgeKey] = 'active';
                            scheduleConnectionLayerRefresh();
                        }
                        if(target.type === 'smart-loop'){
                            outputs = outputImagesForNode(source, true, ctx).filter(img => img?.url);
                            sharedRefs = cascadeRefsFromOutputs(outputs, source);
                        } else if(index === 0){
                            outputs = await runCascadeStepIntoNode(source, target, incomingRefs, stepCtx);
                            sharedRefs = cascadeRefsFromOutputs(outputs, target);
                        } else {
                            outputs = appendCascadeRefsToReceiver(target, sharedRefs, stepCtx);
                        }
                    } catch(err) {
                        if(/缺少提示词|需要输入文本|need prompt/i.test(err.message || '') && incomingRefs.length){
                            outputs = appendCascadeRefsToReceiver(target, incomingRefs, stepCtx);
                            if(index === 0){
                                sharedRefs = cascadeRefsFromOutputs(outputs, target);
                            }
                        } else {
                            throw err;
                        }
                    }
                    if(runState.runPath){
                        runState.runPath.states[edgeKey] = 'done';
                        scheduleConnectionLayerRefresh();
                    }
                    const refs = target.type === 'smart-loop' ? sharedRefs : (index === 0 ? sharedRefs : cascadeRefsFromOutputs(outputs, target));
                    producedRefs.set(target.id, refs);
                    throwIfSmartCascadeStopRequested(runState);
                    await runBranch(target, refs);
                }
            };
            const rootRefs = defaultReferenceImagesFor(graph.root, true, ctx).filter(img => img?.url);
            producedRefs.set(graph.root.id, rootRefs);
            await runBranch(graph.root, rootRefs);
        };
        const roundIndexes = Array.from({length:totalRounds}, (_, round) => startIndex + round * batchSize);
        if(loopMode === 'parallel' && totalRounds > 1){
            const parallelTargets = singleNodeLoopRun
                ? singleLoopSlots
                : [];
            if(parallelTargets.length) render();
            await runSmartCascadeRoundsWithLimit(roundIndexes, parallelLimit, (loopIndex, roundOffset) => {
                const outputTarget = parallelTargets[roundOffset] || null;
                return runRound(loopIndex, {outputTarget});
            }, runState);
        } else {
            for(const loopIndex of roundIndexes){
                throwIfSmartCascadeStopRequested(runState);
                await runRound(loopIndex);
            }
        }
        throwIfSmartCascadeStopRequested(runState);
        if(parallelLimit === 1) smartLoopContext = null;
        selectedId = '';
        selectedIds = [];
        selectedImage = {nodeId:'', index:-1};
        activeComposerSubject = null;
        lastComposerNodeId = '';
        composer.classList.remove('open');
        settings = originalSettings;
        promptInput.innerHTML = originalPromptHtml;
        scheduleSave();
        toast(totalRounds > 1
            ? trf(loopMode === 'parallel' ? 'smart.loopParallelRoundsDone' : 'smart.loopRunRoundsDone', {n:totalRounds})
            : tr('smart.loopRunDone'));
    } catch(e) {
        if(parallelLimit === 1) smartLoopContext = null;
        selectedId = originalSelected;
        settings = originalSettings;
        promptInput.innerHTML = originalPromptHtml;
        toast(e?.smartCascadeStopped ? '已停止一键运行' : (e.message || tr('smart.errRunFailed')).slice(0, 160));
    } finally {
        smartCascadeRuns.delete(runKey);
        syncSmartCascadeLegacyState();
        smartCascadeSilentSelection = false;
        syncRunButtonState();
        if(cascadeRunBtn) cascadeRunBtn.disabled = false;
        if(directLoopTargetRun) finishLoopTargetPreviewState(tail);
        scheduleSave();
        render();
    }
}
function runSmartCascadeFromLoop(loopId){
    const loop = nodes.find(n => n.id === loopId && n.type === 'smart-loop');
    if(!loop){ toast('没有找到循环节点'); return; }
    const tail = cascadeTailForLoop(loop.id);
    if(!tail){ toast('请把循环节点连接到下游图片链路'); return; }
    selectedId = tail.id;
    selectedIds = [];
    selectedImage = {nodeId:'', index:-1};
    runSmartCascade(tail);
}
async function runGeneration(){
    const node = selectedNode();
    if(!node) return;
    if(smartNodeInFlight(node)) return;
    const previousSettings = cloneSmartSettings(settings);
    const runSettings = smartSettingsForNode(node);
    settings = {...settings, ...cloneSmartSettings(runSettings || {})};
    let request = buildPromptRequest(node, null, false, smartLoopContext);
    let prompt = request.prompt.trim();
    let refs = request.refs;
    try {
        smartValidateReferenceRequest(node, prompt, refs);
    } catch(error) {
        settings = previousSettings;
        toast(error.message);
        return;
    }
    if(!prompt && smartRunNeedsPrompt(settings)){
        settings = previousSettings;
        toast(tr('smart.toastNeedPrompt'));
        return;
    }
    const outpaintSize = node?.outpaintSize && Number(node.outpaintSize.width) > 0 && Number(node.outpaintSize.height) > 0
        ? {width:Math.round(Number(node.outpaintSize.width)), height:Math.round(Number(node.outpaintSize.height))}
        : null;
    if(outpaintSize && isApiLikeEngine(settings.engine) && settings.apiKind !== 'video'){
        settings = {
            ...settings,
            resolution:'custom',
            ratio:'',
            customWidth:outpaintSize.width,
            customHeight:outpaintSize.height,
            customSize:`${outpaintSize.width}x${outpaintSize.height}`
        };
    }
    const logKind = isApiLikeEngine(settings.engine) && settings.apiKind === 'video' ? 'video' : 'image';
    let trace = smartBuildGenerationTrace({node, prompt, refs, runSettings:settings, kind:logKind});
    const confirmed = await confirmSmartGenerationPreflight(trace);
    if(!confirmed){
        settings = previousSettings;
        return;
    }
    smartGenerationSubmitting = true;
    syncRunButtonState();
    request = buildPromptRequest(node, null, true, smartLoopContext);
    prompt = request.prompt.trim();
    refs = request.refs;
    try {
        smartValidateReferenceRequest(node, prompt, refs);
    } catch(error) {
        smartGenerationSubmitting = false;
        syncRunButtonState();
        settings = previousSettings;
        toast(error.message);
        return;
    }
    trace = smartBuildGenerationTrace({node, prompt, refs, runSettings:settings, kind:logKind});
    const meta = snapshotRunMeta(prompt, node.id, request.displayPrompt, refs, trace);
    const runLog = smartRunSnapshot(node, prompt, refs, logKind);
    rememberRecentSmartSettings(settings, node);
    const runLogStart = nowMs();
    const expectedCount = Math.max(1, Math.min(8, Number(settings.count || 1)));
    const apiConcurrentRun = isApiLikeEngine(settings.engine) || settings.engine === 'modelscope';
    const nodeHasImages = isSmartGroupNode(node) ? imagesForNode(node).some(img => img?.url) : (node.images || []).some(img => img?.url);
    const workflowModeRun = smartImageUsesWorkflowInput(node, smartLoopContext);
    const sourceVisualState = isSmartImageNode(node) && nodeHasImages && !workflowModeRun ? {
        images:(node.images || []).map(img => ({...img})),
        title:node.title,
        w:node.w,
        h:node.h,
        scale:node.scale,
        outputKind:node.outputKind
    } : null;
    pushUndo();
    let extracted = null;
    let branchNode = null;
    const groupRun = isSmartGroupNode(node);
    const shouldCreateBranchOutput = groupRun || (nodeHasImages && !workflowModeRun);
    const pendingMeta = shouldCreateBranchOutput ? stripRunInputMeta(meta) : meta;
    undoSuppressed = true;
    if(shouldCreateBranchOutput) branchNode = createPendingOutputFromSource(node, expectedCount, pendingMeta, {connectSource:false, selectOutput:true, refs});
    undoSuppressed = false;
    const pendingNode = branchNode || node;
    if(extracted) pendingNode._runMetaTargetId = extracted.id;
    if(!branchNode){
        pendingNode.pending = Math.max(1, Number(expectedCount) || 1);
        pendingNode.runStartedAt = nowMs();
        delete pendingNode.runFinishedAt;
        delete pendingNode.runElapsedMs;
        pendingNode.runTimerHidden = false;
        const pendingBox = pendingBoxSize(pendingNode.pending, {sourceNode:node, refs});
        pendingNode.w = pendingBox.w;
        pendingNode.h = pendingBox.h;
        attachRunMeta(pendingNode, pendingMeta);
    }
    if(apiConcurrentRun){
        coolNodeRunningState(pendingNode, 2000);
        syncRunButtonState();
    } else {
        pendingNode.running = true;
        syncRunButtonState();
    }
    render();
    try {
        if(isApiLikeEngine(settings.engine) && settings.apiKind === 'video'){
            const outVideos = await runApiVideoGeneration(prompt, refs);
            if(!outVideos.length) throw new Error(tr('smart.errNoOutVideos'));
            finalizePendingNode(pendingNode, outVideos, pendingMeta, 'video');
            if(sourceVisualState) restoreSourceVisualState(node, sourceVisualState);
            addSmartGenerationLog({run:runLog, outputs:outVideos, runMs:nowMs() - runLogStart});
            clearPromptInput({preserveDraft:true});
            settings = previousSettings;
            scheduleSave();
            return;
        }
        const outImages = settings.engine === 'modelscope'
            ? await runModelscopeGeneration(prompt, refs)
            : await runApiGeneration(prompt, refs);
        if(isApiLikeEngine(settings.engine)){
            const taskIds = Array.isArray(outImages?.taskIds) ? outImages.taskIds : [];
            if(!taskIds.length) throw new Error(tr('smart.errRunFailed'));
            const requestedSize = sizeForRun(settings);
            pendingNode.pendingTasks = taskIds.map(taskId => ({taskId, kind:'image', providerId:outImages.providerId, model:outImages.model, size:requestedSize}));
            pendingNode.pending = Math.max(taskIds.length, Number(pendingNode.pending || 0) || taskIds.length);
            pendingNode.runStartedAt = nowMs();
            pendingNode.runTimerHidden = false;
            pendingNode.running = false;
            render();
            scheduleSave();
            await saveCanvas();
            await resumeSmartPendingNode(pendingNode);
            if(taskIds.some(isSmartTaskCancelled) || !nodes.some(n => n.id === pendingNode.id)){
                if(sourceVisualState) restoreSourceVisualState(node, sourceVisualState);
                settings = previousSettings;
                scheduleSave();
                return;
            }
            if(pendingNode.jimengPending || smartRecoverableImageTask(pendingNode)){
                if(sourceVisualState) restoreSourceVisualState(node, sourceVisualState);
                clearPromptInput({preserveDraft:true});
                settings = previousSettings;
                scheduleSave();
                return;
            }
            if(!(pendingNode.images || []).length) throw new Error(tr('smart.errNoOutImages'));
            if(outpaintSize) delete node.outpaintSize;
            if(sourceVisualState) restoreSourceVisualState(node, sourceVisualState);
            addSmartGenerationLog({run:runLog, outputs:(pendingNode.images || []).map(img => img.url).filter(Boolean), runMs:nowMs() - runLogStart});
            clearPromptInput({preserveDraft:true});
            settings = previousSettings;
            scheduleSave();
            return;
        }
        if(!outImages.length) throw new Error(tr('smart.errNoOutImages'));
        if(outpaintSize) delete node.outpaintSize;
        finalizePendingNode(pendingNode, outImages, pendingMeta);
        if(sourceVisualState) restoreSourceVisualState(node, sourceVisualState);
        addSmartGenerationLog({run:runLog, outputs:outImages, runMs:nowMs() - runLogStart});
        clearPromptInput({preserveDraft:true});
        settings = previousSettings;
        scheduleSave();
    } catch(e) {
        settings = previousSettings;
        if(handleJimengPendingSignal(pendingNode, e)){
            if(sourceVisualState) restoreSourceVisualState(node, sourceVisualState);
            delete pendingNode._runMetaTargetId;
            clearPromptInput({preserveDraft:true});
            return;
        }
        pendingNode.pending = 0;
        if(branchNode){
            nodes = nodes.filter(n => n.id !== branchNode.id);
            canvas.connections = (canvas.connections || []).filter(c => c.from !== branchNode.id && c.to !== branchNode.id);
            selectedId = node.id;
        } else {
            if(!(pendingNode.images || []).length){
                closeFailedEmptyRunNode(pendingNode);
            } else {
                clearSmartNodeBusyState(pendingNode);
            }
        }
        if(extracted) restoreFromExtraction(node, extracted);
        delete pendingNode._runMetaTargetId;
        addSmartGenerationLog({run:runLog, outputs:[], runMs:nowMs() - runLogStart, error:e.message || String(e)});
        toast((e.message || tr('smart.errRunFailed')).slice(0, 160));
    } finally {
        if(!apiConcurrentRun){
            clearNodeRunningState(pendingNode);
            syncRunButtonState();
        }
        smartGenerationSubmitting = false;
        syncRunButtonState();
        render();
    }
}
async function runPromptLLMNode(nodeId){
    const node = nodes.find(n => n.id === nodeId);
    if(!node || node.type !== 'smart-prompt') return;
    if(node.styleMatch){
        await runStyleMatchedPromptNode(nodeId);
        return;
    }
    const rawMessage = promptNodeLLMInputText(node).trim();
    if(!rawMessage){ toast(tr('smart.promptLlmNeedText')); return; }
    const messageBudget = smartCompressPromptToBudget(rawMessage, SMART_LLM_MESSAGE_BUDGET);
    const message = messageBudget.prompt;
    smartNotifyPromptCompression(messageBudget, 'LLM 输入');
    const systemPrompt = (node.llmSystemPrompt || '').trim();
    node.llmEnabled = true;
    node.running = true;
    render();
    try {
        const provider = resolveChatProviderId(node.llmProvider || '');
        const model = resolveChatModel(node.llmModel || '', provider);
        const mediaRefs = promptNodeInputMediaForLLM(node);
        const images = imageRefsOnly(mediaRefs).map(img => img.url).filter(Boolean);
        const videos = videoRefsOnly(mediaRefs).map(video => video.url).filter(Boolean);
        const result = await fetch('/api/canvas-llm', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                message,
                messages:[],
                images,
                videos,
                model,
                provider,
                ms_model: provider === 'modelscope' ? model : '',
                system_prompt:node.llmSystemEnabled ? (systemPrompt || 'You are a helpful prompt assistant.') : ''
            })
        }).then(async r => {
            if(!r.ok) throw new Error(await r.text());
            return r.json();
        });
        const resultText = String(result.text || '').trim();
        if(resultText){
            const nextText = promptNodeLLMShouldReplace(node)
                ? resultText
                : appendLLMOutputToPromptText(node.text, resultText);
            const promptBudget = smartCompressPromptToBudget(nextText, SMART_MATCHED_PROMPT_BUDGET);
            node.text = promptBudget.prompt;
            node.llmInstruction = '';
            smartNotifyPromptCompression(promptBudget);
        }
        node.llmProvider = provider;
        node.llmModel = model;
        scheduleSave();
    } catch(e) {
        toast((e.message || tr('smart.promptLlmFailed')).slice(0, 160));
    } finally {
        node.running = false;
        render();
    }
}
function smartCreativeVariantRequested(prompt){
    const text = String(prompt || '').toLowerCase();
    return /不同(?:视角|角度|镜头|构图|风格|画面|姿势)|(?:视角|角度|镜头|构图|风格|画面|姿势).*不同|变化大|差异大|随机|多样|发散|换(?:视角|角度|镜头|构图|风格)|different\s+(?:angle|view|perspective|style|composition|camera|pose)|varied|diverse|creative\s+variation/i.test(text);
}
function smartRelaxPromptForReferenceSimilarity(prompt){
    let text = String(prompt || '');
    text = text.replace(
        /Use the attached reference image as a strict composition and style reference\./gi,
        'Use the attached reference image as a loose campaign-style reference, not as an exact composition to copy.'
    );
    text = text.replace(
        /Preserve its aspect ratio, poster\/campaign layout, camera angle, lens proximity, subject scale hierarchy, foreground\/background relationship, object placement, pose and interaction geometry, negative-space distribution, lighting direction, color palette, and commercial finish\./gi,
        'Preserve the broad campaign mood, lighting direction, color palette, product-to-subject relationship, and commercial finish, but allow a new aspect/crop feel, camera distance, pose, hand placement, product position, and negative-space rhythm.'
    );
    text = text.replace(
        /strictly preserves? the reference image composition skeleton[^.\n]*\./gi,
        'keeps only the broad campaign composition family while avoiding a duplicated layout.'
    );
    text = text.replace(/\bmodel identity\b/gi, 'model styling category');
    text = text.replace(/\bsubject identity\b/gi, 'subject styling category');
    text = text.replace(/\bperson identity\b/gi, 'person styling category');
    text = text.replace(/\bface identity\b/gi, 'face styling category');
    text = text.replace(/\bsame person\b/gi, 'same commercial beauty category, not the same person');
    text = text.replace(/\bsame model\b/gi, 'similar commercial model type, not the same model');
    text = text.replace(/\bpreserve (?:the )?(?:model|person|subject|face) identity\b/gi, 'preserve only the styling category, not the exact person identity');
    text = text.replace(/\bkeep (?:the )?(?:model|person|subject|face) identity\b/gi, 'keep only the styling category, not the exact person identity');
    text = text.replace(/the attached user reference image is the primary reference/gi, 'the original style image is prompt guidance only unless it is listed in the uploaded image role map');
    text = text.replace(/the attached reference image as a loose campaign-style reference/gi, 'the original style image as text-only loose campaign-style guidance when it is not listed in the uploaded image role map');
    text = text.replace(/Composition lock:/gi, 'Loose style guidance:');
    text = text.replace(/strict composition(?: and style)? reference/gi, 'loose style reference');
    text = text.replace(/\bpreserve (?:the )?reference (?:image )?aspect ratio\b/gi, 'do not preserve the reference image aspect ratio');
    text = text.replace(/\bpreserve (?:its|the) aspect ratio\b/gi, 'do not preserve the reference aspect ratio');
    return text;
}
function smartRelaxPromptForCreativeVariants(prompt){
    let text = String(prompt || '');
    text = text.replace(
        /Use the attached reference image as a strict composition and style reference\./gi,
        'Use the attached reference image as a loose product, palette, lighting, and commercial-style reference.'
    );
    text = text.replace(
        /Preserve its aspect ratio, poster\/campaign layout, camera angle, lens proximity, subject scale hierarchy, foreground\/background relationship, object placement, pose and interaction geometry, negative-space distribution, lighting direction, color palette, and commercial finish\./gi,
        'Keep the product identity, fresh palette, clean lighting, and commercial finish, but allow new camera angles, framing, pose, composition, scale hierarchy, and negative-space distribution.'
    );
    text = text.replace(/Composition lock:/gi, 'Loose reference guidance:');
    return text;
}
function smartCameraControlRequested(prompt){
    return /HIGHEST PRIORITY CAMERA OVERRIDE|Camera control enabled/i.test(String(prompt || ''));
}
function smartReplaceCameraConflictSection(text, headingPattern, replacement, nextHeadings){
    const next = nextHeadings || 'Reference summary|Shared style anchor|Generation guidance|Variant plan|Negative constraints|Case-library support|Fresh |Negative prompt|LLM additional guidance|Poster copy enabled|Original reference weight|HIGHEST PRIORITY CAMERA OVERRIDE|FINAL CAMERA CHECK';
    const pattern = new RegExp(`(?:${headingPattern}):\\s*[\\s\\S]*?(?=\\n\\s*\\n\\s*(?:${next})\\b|$)`, 'gi');
    return String(text || '').replace(pattern, replacement);
}
function smartStripStaleBackgroundPaletteLocks(prompt){
    return String(prompt || '')
        .split(/\n{2,}/)
        .map(section => section.trim())
        .filter(section => {
            if(!section) return false;
            if(/LATEST BACKGROUND\/PALETTE OVERRIDE|Active additional generation guidance|Highest priority user modification request|Latest user modification request|Negative prompt/i.test(section)) return true;
            const mentionsVisual = /background|backdrop|palette|color world|colour world|background tone|背景|底色|配色|色调|颜色/i.test(section);
            if(!mentionsVisual) return true;
            const isOldReferenceLock = /^(?:Reference priority:|Use the attached reference image|Lighting\/material lock:|Lighting and material fidelity lock:|Preserve\b|Keep the same\b|Match\b|Reference anchors:)/i.test(section);
            const explicitlyNew = /latest|newly requested|new background|user request|change|replace|switch|different|改为|改变|更换|换成|调整|重新|不再|不要保留|最新需求/i.test(section);
            return !(isOldReferenceLock && !explicitlyNew);
        })
        .join('\n\n');
}
function smartRelaxPromptForCameraControl(prompt){
    let text = String(prompt || '');
    if(!smartCameraControlRequested(text)) return text;
    const latestVisualOverride = /LATEST BACKGROUND\/PALETTE OVERRIDE/i.test(text);
    const cameraBlockPattern = /HIGHEST PRIORITY CAMERA OVERRIDE:[\s\S]*?(?:technical text inside the image\.|$)/gi;
    const legacyCameraBlockPattern = /Camera control enabled:[\s\S]*?(?:technical text inside the image\.|$)/gi;
    let cameraBlocks = text.match(cameraBlockPattern) || text.match(legacyCameraBlockPattern) || [];
    const canonicalCameraBlock = cameraBlocks[0] || '';
    if(canonicalCameraBlock){
        text = text.replace(/FINAL CAMERA CHECK:\s*/gi, '');
        text = text.replace(cameraBlockPattern, '');
        text = text.replace(legacyCameraBlockPattern, '');
        text = `${canonicalCameraBlock}\n\n${text.trim()}`;
    }
    text = text.replace(
        /Use the attached reference image as a strict composition and style reference\./gi,
        'Use the attached reference image only as exact product identity, broad person styling category, material, palette, lighting, skin/product surface quality, background tone, commercial-finish, and exact-readable-poster-copy reference when Poster copy is enabled. Do not use it as a same-person identity, camera, crop, pose, scale, layout, or composition reference.'
    );
    text = text.replace(
        /Preserve its aspect ratio, poster\/campaign layout, camera angle, lens proximity, subject scale hierarchy, foreground\/background relationship, object placement, pose and interaction geometry, negative-space distribution, lighting direction, color palette, and commercial finish\./gi,
        latestVisualOverride
            ? 'Preserve compatible product identity, broad model styling category, material truth, shadow softness, skin retouching level, product surface quality, exact readable poster copy when Poster copy is enabled, and commercial finish. Do not preserve the old reference background tone, backdrop gradient, color palette, camera angle, crop, layout, pose geometry, or negative-space distribution; the latest user request controls background and palette while Camera control controls viewpoint and perspective.'
            : 'Preserve compatible product identity, broad model styling category, material truth, lighting direction, background tone, shadow softness, skin retouching level, product surface quality, color palette, exact readable poster copy when Poster copy is enabled, and commercial finish. Do not preserve exact model/person face identity, reference aspect ratio, poster layout, camera angle, lens proximity, crop, subject scale hierarchy, foreground/background relationship, object placement, pose geometry, or negative-space distribution when camera control changes them.'
    );
    text = text.replace(/Composition lock:/gi, 'Camera-overridden loose composition guidance:');
    text = text.replace(
        /Do not let case matches override the primary reference image's camera angle, composition skeleton, subject scale hierarchy, foreground product dominance, pose geometry, background, or color world\./gi,
        'Do not let case matches override the explicit camera control. Case matches may only improve finish, material rendering, retouching, and advertising polish.'
    );
    text = text.replace(
        /Keep the same straight-on camera,?/gi,
        'Do not keep the same straight-on camera; follow the explicit Camera control,'
    );
    text = text.replace(
        /camera may shift to slight three-quarter view/gi,
        'camera must follow the explicit Camera control'
    );
    text = smartReplaceCameraConflictSection(
        text,
        'Reference anchors',
        latestVisualOverride
            ? 'Reference anchors (camera + latest visual override): keep only exact product truth, broad person styling category, non-conflicting material surface, lighting quality, shadow softness, skin/product finish, exact readable poster copy when Poster copy is enabled, and commercial polish. Do not keep the old reference background tone, palette, wardrobe/prop colors, camera, framing, crop, layout, pose, product scale, reflection layout, or composition anchors.'
            : 'Reference anchors (camera override): keep only exact product truth, broad person styling category, material surface, palette, lighting mood, background tone, shadow softness, skin/product finish, exact readable poster copy when Poster copy is enabled, and commercial polish. Do not keep exact same-person face identity. Ignore any camera, framing, crop, layout, pose, product scale, foreground/background, reflection layout, or composition anchors from reference images.',
        'Composition lock|Reference summary|Shared style anchor|Generation guidance|Variant plan|Negative constraints|Case-library support|Fresh |Negative prompt|LLM additional guidance|Poster copy enabled|Original reference weight|HIGHEST PRIORITY CAMERA OVERRIDE|FINAL CAMERA CHECK'
    );
    text = smartReplaceCameraConflictSection(
        text,
        'Camera-overridden loose composition guidance|Composition lock|Loose reference guidance',
        latestVisualOverride
            ? 'Camera override composition rule: do not copy the reference camera, composition skeleton, poster layout, crop, pose geometry, reflection layout, object placement, foreground/background map, subject scale hierarchy, old background tone, old palette, wardrobe/prop colors, or exact same-person face identity. Recompose around the explicit Camera control and the latest requested background/palette while keeping exact product truth, broad person styling category, material quality, shadow softness, skin treatment, product surface finish, lighting quality, and commercial finish.'
            : 'Camera override composition rule: do not copy the reference composition skeleton, poster layout, crop, pose geometry, reflection layout, object placement, foreground/background map, subject scale hierarchy, negative-space distribution, or exact same-person face identity. Recompose the whole image around the explicit camera control while keeping exact product truth, broad person styling category, exact readable poster copy when Poster copy is enabled, palette, material quality, background tone, shadow softness, skin treatment, product surface finish, lighting mood, and commercial finish.',
        'Reference summary|Shared style anchor|Generation guidance|Variant plan|Negative constraints|Case-library support|Fresh |Negative prompt|LLM additional guidance|Poster copy enabled|Original reference weight|HIGHEST PRIORITY CAMERA OVERRIDE|FINAL CAMERA CHECK'
    );
    text = smartReplaceCameraConflictSection(
        text,
        'Generation guidance',
        latestVisualOverride
            ? 'Generation guidance: Camera control is the primary viewpoint driver and the latest user request is the primary background/palette driver. First satisfy the exact lens, horizontal view, elevation, foreground/midground/background perspective evidence, and subject scale. Then apply the newly requested background and colors. Restore only exact product truth, broad person styling category, non-conflicting materials, lighting quality, shadow softness, skin/product retouching level, and commercial polish; never restore the old reference background or palette.'
            : 'Generation guidance: camera control is the primary composition driver. First satisfy lens, viewpoint, foreground/midground/background, visible perspective evidence, and subject scale. Then restore exact product truth, broad person styling category, exact readable poster copy when Poster copy is enabled, materials, palette, background tone, lighting mood, shadow softness, skin/product retouching level, and commercial polish. Do not restore exact same-person face identity unless reference weight is extremely high and explicitly requested.',
        'Variant plan|Negative constraints|Case-library support|Fresh |Negative prompt|LLM additional guidance|Poster copy enabled|Original reference weight|HIGHEST PRIORITY CAMERA OVERRIDE|FINAL CAMERA CHECK'
    );
    text = smartReplaceCameraConflictSection(
        text,
        'Variant plan',
        'Variant plan: use the selected camera control as the new structural anchor. Variations may change pose and placement as needed to make the requested camera physically readable; do not keep the old reference camera family unless it matches the control.',
        'Negative constraints|Case-library support|Fresh |Negative prompt|LLM additional guidance|Poster copy enabled|Original reference weight|HIGHEST PRIORITY CAMERA OVERRIDE|FINAL CAMERA CHECK'
    );
    text = text.replace(
        /same camera angle family/gi,
        'camera angle family selected by the explicit Camera control'
    );
    text = text.replace(
        /same product-to-model scale hierarchy/gi,
        'product-to-model scale hierarchy rebuilt for the explicit Camera control'
    );
    if(latestVisualOverride) text = smartStripStaleBackgroundPaletteLocks(text);
    cameraBlocks = text.match(cameraBlockPattern) || text.match(legacyCameraBlockPattern) || [];
    const cameraBlock = cameraBlocks[cameraBlocks.length - 1] || '';
    if(cameraBlock && !/FINAL CAMERA CHECK/i.test(text)){
        text = `${text}\n\nFINAL CAMERA CHECK: ${cameraBlock}`;
    }
    return text;
}
function smartCreativeReferenceImages(refs=[]){
    const images = imageRefsOnly(refs);
    const preferred = images.find(ref => ref?.styleLock || ref?.referenceLock || ref?.role === 'composition_reference') || images[0];
    const productRefs = images.filter(ref => ref !== preferred && smartReferenceRoleIsProduct(ref));
    return uniqueReferenceImages([preferred, ...productRefs].filter(Boolean)).slice(0, SMART_REFERENCE_IMAGE_MAX);
}
function smartGenerationReferenceLimit(prompt='', refs=[]){
    const images = imageRefsOnly(refs).filter(smartReferenceUploadAllowed);
    const count = images.length;
    if(count <= 3) return count;
    const productCount = smartProductTruthRefs(images).length;
    const posterCopy = smartPosterCopyEnabledInRequest(prompt, images);
    if(/LATEST PRODUCT IDENTITY OVERRIDE/i.test(String(prompt || '')) && productCount >= 3) return Math.min(count, 5);
    return posterCopy || productCount >= 2 ? Math.min(count, 4) : 3;
}
const gpt_image_reference_limit = smartGenerationReferenceLimit;
const SMART_MATCHED_PROMPT_BUDGET = 7000;
const SMART_IMAGE_PROMPT_BUDGET = 12000;
const SMART_POSTER_COPY_PROMPT_BUDGET = 5200;
const SMART_PRODUCT_REPLACEMENT_PROMPT_BUDGET = 5200;
const SMART_PRODUCT_ONLY_REPLACEMENT_PROMPT_BUDGET = 5200;
const SMART_VIDEO_PROMPT_BUDGET = 3600;
const SMART_LLM_MESSAGE_BUDGET = 18000;
let smartPromptCompressionNoticeAt = 0;
function smartNormalizePromptText(value){
    return String(value || '')
        .replace(/\r\n?/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/ *\n */g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
function smartPromptDedupeKey(value){
    return String(value || '')
        .toLowerCase()
        .replace(/[\s"'`“”‘’.,，。:：;；!?！？()[\]{}<>《》【】_-]+/g, '');
}
function smartPromptSectionProfile(value){
    const brandIdentityHead = String(value || '').slice(0, 260);
    if(/brand identity lock|latest product identity override/i.test(brandIdentityHead)){
        return {priority:110, cap:2400, min:750};
    }
    const head = String(value || '').slice(0, 260);
    if(/highest priority|active additional generation guidance|llm additional guidance|product truth references|product recognition summary|product replacement|output canvas lock|camera override|camera-locked variant|latest background\/palette override|final product check|最高优先级|追加生成指导|产品事实|产品识别|产品替换|输出画布/i.test(head)){
        return {priority:110, cap:2400, min:750};
    }
    if(/negative prompt|poster copy|must not|avoid:|负面提示|海报文字/i.test(head)){
        return {priority:90, cap:1400, min:420};
    }
    if(/composition lock|original reference weight|user modification request|reference role assignment|构图锁定|参考图权重|用户修改/i.test(head)){
        return {priority:80, cap:1900, min:520};
    }
    if(/case-library support|variant plan|reference anchors|案例库|变体计划|参考锚点/i.test(head)){
        return {priority:20, cap:650, min:0};
    }
    if(/reference priority|reference summary|shared style anchor|generation guidance|参考优先级|风格锚点|生成指导/i.test(head)){
        return {priority:55, cap:1400, min:260};
    }
    return {priority:65, cap:2600, min:360};
}
function smartClipPromptSection(value, maxLength, safeSentenceMode=false){
    const text = String(value || '').trim();
    const limit = Math.max(0, Number(maxLength) || 0);
    if(!limit || text.length <= limit) return text;
    if(limit < 120) return text.slice(0, limit).trim();
    if(!safeSentenceMode){
        const separator = '\n';
        const headLimit = Math.max(80, Math.floor((limit - separator.length) * 0.72));
        const tailLimit = Math.max(30, limit - headLimit - separator.length);
        let head = text.slice(0, headLimit);
        const headBoundary = Math.max(head.lastIndexOf('\n'), head.lastIndexOf('. '), head.lastIndexOf('。'), head.lastIndexOf('; '), head.lastIndexOf('；'));
        if(headBoundary >= Math.floor(headLimit * 0.62)) head = head.slice(0, headBoundary + 1);
        let tail = text.slice(-tailLimit);
        const tailBoundaryCandidates = [tail.indexOf('\n'), tail.indexOf('. '), tail.indexOf('。'), tail.indexOf('; '), tail.indexOf('；')].filter(index => index >= 0);
        const tailBoundary = tailBoundaryCandidates.length ? Math.min(...tailBoundaryCandidates) : -1;
        if(tailBoundary >= 0 && tailBoundary <= Math.floor(tailLimit * 0.38)) tail = tail.slice(tailBoundary + 1);
        return `${head.trim()}${separator}${tail.trim()}`.trim().slice(0, limit);
    }
    const headLimit = Math.max(80, limit);
    let head = text.slice(0, headLimit);
    const boundaryPattern = /[\n。.!?！？；;]\s*/g;
    let boundary = -1;
    let match;
    while((match = boundaryPattern.exec(head))){
        const end = match.index + match[0].length;
        if(end >= Math.floor(limit * 0.62)) boundary = end;
    }
    if(boundary > 0) head = head.slice(0, boundary);
    else {
        const softBoundary = Math.max(head.lastIndexOf(', '), head.lastIndexOf('，'), head.lastIndexOf('、'), head.lastIndexOf(' '));
        if(softBoundary >= Math.floor(limit * 0.72)) head = head.slice(0, softBoundary);
    }
    head = head.trim().slice(0, limit).replace(/[,:：，、;；-]\s*$/, '').trim();
    const lines = head.split('\n');
    const lastLine = lines[lines.length - 1] || '';
    if(lines.length > 1 && /[:：]\s*$/.test(lastLine) && lastLine.length <= 80){
        lines.pop();
        head = lines.join('\n').trim();
    }
    return head;
}
function smartPromptSections(value){
    const normalized = smartNormalizePromptText(value);
    if(!normalized) return [];
    const initial = normalized.split(/\n{2,}/).map(item => item.trim()).filter(Boolean);
    const expanded = initial.flatMap(item => {
        if(item.length < 2600 || !item.includes('\n')) return [item];
        const parts = item.split(/\n(?=(?:[A-Z][A-Za-z0-9 /_-]{2,60}|[\u4e00-\u9fff]{2,18})[:：])/)
            .map(part => part.trim())
            .filter(Boolean);
        return parts.length > 1 ? parts : [item];
    });
    const seen = new Set();
    return expanded.filter(item => {
        const key = smartPromptDedupeKey(item);
        if(!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
function smartRepairPromptFragments(value){
    return String(value || '')
        .split(/\n{2,}/)
        .map(section => section.trim())
        .filter(section => {
            if(!section) return false;
            if(/^(?:bject|ground tone|h components|selected output|hile keeping|g, crisp|, watermark|Case-library su|for|ver|shadow_quality|fabric_tex)\b/i.test(section)) return false;
            return true;
        })
        .join('\n\n');
}
function smartCompressPromptToBudget(value, budget=SMART_IMAGE_PROMPT_BUDGET, options={}){
    const safeSentenceMode = options?.repairFragments === true;
    const original = smartNormalizePromptText(safeSentenceMode ? smartRepairPromptFragments(value) : value);
    const maxLength = Math.max(300, Number(budget) || SMART_IMAGE_PROMPT_BUDGET);
    if(!original || original.length <= maxLength){
        return {prompt:original, originalLength:original.length, compressedLength:original.length, changed:false};
    }
    const entries = smartPromptSections(original).map((text, index) => {
        const profile = smartPromptSectionProfile(text);
        return {...profile, index, text:smartClipPromptSection(text, profile.cap, safeSentenceMode)};
    });
    const joinedLength = () => entries.filter(entry => entry.text).map(entry => entry.text).join('\n\n').length;
    const lowPriority = [...entries].sort((a, b) => a.priority - b.priority || b.text.length - a.text.length);
    for(const entry of lowPriority){
        let overflow = joinedLength() - maxLength;
        if(overflow <= 0) break;
        const target = Math.max(entry.min, entry.text.length - overflow);
        if(target < entry.text.length) entry.text = target > 0 ? smartClipPromptSection(entry.text, target, safeSentenceMode) : '';
    }
    let prompt = entries.filter(entry => entry.text).sort((a, b) => a.index - b.index).map(entry => entry.text).join('\n\n');
    if(prompt.length > maxLength) prompt = smartClipPromptSection(prompt, maxLength, safeSentenceMode);
    prompt = smartNormalizePromptText(prompt).slice(0, maxLength);
    return {
        prompt,
        originalLength:original.length,
        compressedLength:prompt.length,
        changed:prompt.length < original.length
    };
}
function smartNotifyPromptCompression(result, label='提示词'){
    if(!result?.changed || result.originalLength - result.compressedLength < 80) return;
    const now = Date.now();
    if(now - smartPromptCompressionNoticeAt < 800) return;
    smartPromptCompressionNoticeAt = now;
    toast(`${label}已自动压缩 ${result.originalLength} → ${result.compressedLength} 字，优先保留产品与用户要求`);
}
function smartNodeHasUpstreamReferenceAssets(node){
    if(!node) return false;
    return upstreamLineNodeIds(node).some(id => {
        if(id === node.id) return false;
        const source = nodes.find(item => item.id === id);
        return imagesForNode(source).some(ref => ref?.url)
            || manualReferenceImagesFor(source).some(ref => ref?.url);
    });
}
function smartValidateReferenceRequest(node, prompt, refs=[]){
    if(imageRefsOnly(refs).length) return true;
    const text = String(prompt || '');
    const explicitReferenceIntent = /Product truth references:|product-truth reference|attached product reference|(?:图|图片|参考图)\s*[2-9]|(?:image|reference)\s*#?\s*[2-9]/i.test(text);
    if(smartNodeHasUpstreamReferenceAssets(node) || explicitReferenceIntent){
        throw new Error('检测到产品/参考图要求，但实际请求没有携带图片。请检查上游连线，已阻止纯文本误生成。');
    }
    return true;
}
function smartPosterCopyEnabledInRequest(prompt='', refs=[]){
    return /POSTER COPY LOCK:|Poster copy enabled:|lightweight text guide|poster-text guide/i.test(String(prompt || ''))
        || imageRefsOnly(refs).some(ref => ref?.posterCopyReference || ref?.copyTextLock);
}
function smartVariantPrompt(prompt, index, total, refs=[]){
    const count = Math.max(1, Number(total) || 1);
    if(count <= 1) return prompt;
    const cameraControlled = smartCameraControlRequested(prompt);
    if(cameraControlled){
        const text = smartRelaxPromptForCameraControl(String(prompt || ''));
        const allowHuman = !String(text || '').includes('NO HUMAN SUBJECT LOCK:');
        const humanPlans = [
            'Keep the exact selected camera. Vary only the model’s hand gesture, facial expression, and the precise product-contact point on the nose or cheek; keep lens, horizontal view, camera elevation, perspective, crop family, and subject scale unchanged.',
            'Keep the exact selected camera. Use a clearly different arm/hand pose and product-use gesture while maintaining the same lens, front/side direction, camera height, perspective, crop family, and background layout.',
            'Keep the exact selected camera. Change only expression, shoulder/hand gesture, and product interaction timing; do not rotate or raise/lower the camera.',
            'Keep the exact selected camera. Create a distinct action through hand placement and product position within the frame, never through a different viewpoint or focal length.'
        ];
        const productPlans = [
            'Keep the exact selected camera. Vary only product rotation within the support surface, prop spacing, and lighting sweep; keep lens, horizontal view, camera elevation, perspective, and crop family unchanged.',
            'Keep the exact selected camera. Create a distinct product arrangement without changing viewpoint, focal length, camera height, or background geometry.',
            'Keep the exact selected camera. Vary only product-contact shadows, supporting props, and product placement within the same fixed frame.',
            'Keep the exact selected camera. Use a different product presentation gesture or support arrangement while preserving the fixed optical viewpoint.'
        ];
        const plan = (allowHuman ? humanPlans : productPlans)[index % humanPlans.length];
        const lock = 'CAMERA-LOCKED VARIANT: Camera control overrides every request for different angle, viewpoint, perspective, camera direction, or camera height. Interpret “different actions/angles” as different pose, gesture, expression, product contact, or in-frame placement only. Do not change the selected focal length, azimuth, elevation, optical perspective, crop family, or subject scale.';
        const quality = allowHuman
            ? 'Premium commercial advertising finish. Keep the product clearly used against the face with realistic hand contact, natural anatomy, refined skin texture, and clean color grading.'
            : 'Premium commercial advertising finish. Keep exact product identity, realistic edges, controlled contact shadows, refined materials, and clean color grading.';
        return [text, `Variant ${index + 1} of ${count}: ${plan}`, lock, quality].filter(Boolean).join('\n\n');
    }
    const creative = smartCreativeVariantRequested(prompt);
    const editBaseLocked = (refs || []).some(ref => ref?.generatedEditBase || ref?.structureLock);
    if(editBaseLocked && !creative){
        return [
            String(prompt || ''),
            `Variant ${index + 1} of ${count}: preserve the locked edit-base structure. Keep the same composition skeleton, crop family, subject scale, pose/hand-placement family, product-to-person relationship, background color world, lighting direction, and negative-space rhythm. Vary only minor rendering polish and the latest requested modification.`
        ].filter(Boolean).join('\n\n');
    }
    const text = creative ? smartRelaxPromptForCreativeVariants(prompt) : String(prompt || '');
    const allowHuman = !String(text || '').includes('NO HUMAN SUBJECT LOCK:');
    const styleWeight = Math.max(...(refs || []).map(ref => smartReferenceRoleIsProduct(ref) ? 0 : smartReferenceRoleWeight(ref)), 0);
    const refLocked = styleWeight >= 85 && (
        (refs || []).some(ref => ref?.styleLock || ref?.referenceLock)
        || /strict composition|composition lock/i.test(text)
    );
    const posePlans = [
        'Hero pose: keep the product closest to the lens, model reaches forward confidently, open expressive hand gesture, bright direct eye contact.',
        'Alternate pose: keep the same product dominance and lens proximity, change the model body turn and arm gesture clearly, more playful expression.',
        'Side-energy pose: preserve the same campaign layout, rotate shoulders slightly, use a different hand framing gesture, keep the product large in foreground.',
        'Editorial pose: preserve foreground product hierarchy, model leans or twists differently, refined expression, clean silhouette and natural hands.'
    ];
    const productOnlyPosePlans = [
        'Hero product composition: keep the product closest to the lens, use premium support props, surface contact shadows, and strong product dominance with no human body parts.',
        'Alternate product composition: keep the same SKU dominance, change product angle, prop arrangement, lighting sweep, and foreground/background spacing with no people or hands.',
        'Mechanical display composition: preserve product hierarchy, show the product supported by product-safe props or environment elements, with realistic shadows and no human model.',
        'Editorial product still life: preserve product clarity and premium finish, vary crop, surface, background depth, and product placement while keeping a strict no-human scene.'
    ];
    const creativePlans = [
        'Fresh low-angle hero close-up, strong foreground product, playful sporty beauty-ad energy, clean sky background.',
        'Three-quarter side view with a wider crop, different arm gesture and body turn, more lifestyle editorial styling while keeping the same mint-blue campaign palette.',
        'Dynamic diagonal camera angle with a slightly higher viewpoint, product still clearly readable, more motion and asymmetry in the pose.',
        'Clean portrait-ad composition with a different crop and gesture, product near camera but not identical placement, refined commercial fashion-beauty finish.'
    ];
    const productOnlyCreativePlans = [
        'Fresh low-angle hero product close-up, strong foreground product, energetic premium ad lighting, clean background, no people or hands.',
        'Three-quarter product still-life view with a wider crop, different prop/support arrangement, polished commercial styling, no human body parts.',
        'Dynamic diagonal product camera angle with a slightly higher viewpoint, product still clearly readable, more motion in lighting and background elements, no people or hands.',
        'Clean product-ad composition with a different crop and product placement, refined commercial finish, strict object-only scene.'
    ];
    const lock = creative
        ? (allowHuman
            ? 'Creative variation mode: override any earlier strict composition lock. Use the reference only for exact product identity, broad person styling category, palette, lighting, and commercial polish. Each output should use a noticeably different camera angle, crop, pose, composition, and non-identical person face while staying in the same campaign world.'
            : 'Creative variation mode: override any earlier strict composition lock. Use the reference only for exact product identity, palette, lighting, material quality, and commercial polish. Each output should use a noticeably different product-only camera angle, crop, prop arrangement, composition, and background rhythm while keeping no human subject.')
        : refLocked
        ? (allowHuman
            ? 'Keep the broad reference-image campaign family and product-to-model scale, but do not clone the exact image. Change the exact crop, hand placement, pose, expression, product position, and small layout details.'
            : 'Keep the broad reference-image product campaign family and product scale, but do not clone the exact image. Change the exact crop, product placement, prop/support arrangement, surface contact, shadow shape, and small layout details. No human subject.')
        : (allowHuman
            ? 'Create a clearly distinct variation while keeping the same campaign style, palette, lighting quality, broad person styling category, and strict product SKU identity. Do not keep exact same-person face identity.'
            : 'Create a clearly distinct product-only variation while keeping the same campaign style, palette, lighting quality, material polish, and strict product SKU identity. Do not add any person, hand, face, skin, body, or human silhouette.');
    const quality = allowHuman
        ? 'Premium commercial advertising finish. Crisp focus on the hero product and face, refined skin texture, clean background, realistic hands, natural anatomy, polished color grading. Avoid blurry output, duplicated limbs, warped fingers, flat lighting, cheap stock-photo styling, clutter, low-detail product rendering.'
        : 'Premium commercial advertising finish. Crisp focus on the hero product, refined material texture, clean background, realistic product edges and contact shadows, polished color grading. Avoid blurry output, fake human body parts, hands, faces, skin, mannequins, flat lighting, cheap stock-photo styling, clutter, low-detail product rendering.';
    const plan = creative
        ? (allowHuman ? creativePlans : productOnlyCreativePlans)[index % creativePlans.length]
        : (allowHuman ? posePlans : productOnlyPosePlans)[index % posePlans.length];
    return [text, `Variant ${index + 1} of ${count}: ${plan}`, lock, quality].filter(Boolean).join('\n\n');
}
async function runApiGeneration(prompt, refs, runSettings=settings){
    if(!runSettings.provider_id || !runSettings.model) throw new Error(tr('smart.errNoApiModel'));
    const count = Math.max(1, Math.min(8, Number(runSettings.count || 1)));
    const canvasLock = outputCanvasLockPrompt(runSettings);
    const effectivePrompt = [canvasLock, smartRelaxPromptForReferenceSimilarity(smartRelaxPromptForCameraControl(prompt))]
        .filter(Boolean)
        .join('\n\n');
    const creative = smartCreativeVariantRequested(effectivePrompt);
    const cameraControlled = smartCameraControlRequested(effectivePrompt);
    const referencePool = creative || cameraControlled ? smartCreativeReferenceImages(refs) : imageRefsOnly(refs);
    const referenceImages = referencePool
        .filter(smartReferenceUploadAllowed)
        .slice(0, smartGenerationReferenceLimit(effectivePrompt, referencePool));
    const productPrompt = await smartPromptWithProductRecognition(effectivePrompt, referenceImages, runSettings);
    const productReplacement = Boolean(smartProductReplacementRolePrompt(referenceImages));
    const productOnlyReplacement = productReplacement && String(effectivePrompt || '').includes('NO HUMAN SUBJECT LOCK:');
    const posterCopyEnabledRun = smartPosterCopyEnabledInRequest(productPrompt || effectivePrompt, referenceImages);
    const requestBudget = productOnlyReplacement
        ? SMART_PRODUCT_ONLY_REPLACEMENT_PROMPT_BUDGET
        : productReplacement
            ? SMART_PRODUCT_REPLACEMENT_PROMPT_BUDGET
            : posterCopyEnabledRun
                ? SMART_POSTER_COPY_PROMPT_BUDGET
            : SMART_IMAGE_PROMPT_BUDGET;
    const baseBudget = Math.max(3000, requestBudget - (count > 1 ? 700 : 0));
    const compressionOptions = productOnlyReplacement ? {repairFragments:true} : {};
    const compressedBase = smartCompressPromptToBudget(productPrompt, baseBudget, compressionOptions);
    smartNotifyPromptCompression(compressedBase);
    const basePayload = {provider_id:runSettings.provider_id, model:runSettings.model, size:sizeForRun(runSettings), quality:runSettings.quality || 'auto', n:1, reference_images:referenceImages};
    const tasks = await Promise.all(Array.from({length:count}, (_, index) => {
        const variantPrompt = smartVariantPrompt(compressedBase.prompt, index, count, referenceImages);
        const payload = {...basePayload, prompt:smartCompressPromptToBudget(variantPrompt, requestBudget, compressionOptions).prompt};
        return fetch('/api/canvas-image-tasks', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)}).then(async r => {
            if(!r.ok) throw new Error(await r.text());
            return r.json();
        });
    }));
    return {taskIds:tasks.map(task => task.task_id).filter(Boolean), count, providerId:basePayload.provider_id, model:basePayload.model};
}
async function runApiVideoGeneration(prompt, refs, runSettings=settings){
    if(!runSettings.videoModel) throw new Error(tr('smart.errNoVideoModel'));
    try {
        const uploadedRefs = applyUploadedUrlsToSmartRefs(refs, runSettings);
        const trustedMode = Boolean(runSettings.videoTrustedAsset);
        const trustedSource = trustedMode ? (['library','cloud','manual'].includes(runSettings.videoTrustedSource) ? runSettings.videoTrustedSource : 'library') : 'none';
        // 仅「素材库链接」来源才走 asset:// 认证地址 + 后端可信素材路由；上传云端/手动网址走普通直链。
        const useAssetUris = trustedSource === 'library';
        const targetPlatform = videoProviderPlatform(runSettings.videoProvider || 'comfly');
        let mismatchedAsset = false;
        const effUrl = ref => {
            const uris = (ref && ref.asset_uris && typeof ref.asset_uris === 'object') ? ref.asset_uris : null;
            if(useAssetUris && uris && Object.keys(uris).length){
                // asset:// 与平台绑定：取当前视频平台对应的认证地址；该素材没注册到这个平台就回退本地 url
                if(targetPlatform && uris[targetPlatform]) return uris[targetPlatform];
                mismatchedAsset = true;
            }
            return ref?.url;
        };
        const refImages = imageRefsOnly(uploadedRefs).map((ref, i) => {
            const item = {url:effUrl(ref), name:ref.name || `图${i + 1}`};
            if(runSettings.videoUseFrameRoles){
                if(i === 0) item.role = 'first_frame';
                else if(i === 1) item.role = 'last_frame';
            }
            return item;
        });
        const manualVideo = manualSmartVideoLink(runSettings)?.url || '';
        const refVideos = manualVideo ? manualSmartMediaLinks(runSettings).map(item => item.url).filter(Boolean) : videoRefsOnly(uploadedRefs).map(ref => effUrl(ref)).filter(Boolean);
        const refAudios = audioRefsOnly(uploadedRefs).map(ref => effUrl(ref)).filter(Boolean).slice(0, 3);
        if(mismatchedAsset) toast('部分认证素材属于其它平台，已回退为普通素材。切换到对应平台的视频接口才能用 asset:// 认证地址。');
        const compressedPrompt = smartCompressPromptToBudget(prompt, SMART_VIDEO_PROMPT_BUDGET);
        smartNotifyPromptCompression(compressedPrompt, '视频提示词');
        const payload = {
            prompt: compressedPrompt.prompt,
            provider_id: runSettings.videoProvider || 'comfly',
            model: runSettings.videoModel || 'veo3-fast',
            duration: Math.max(1, Math.min(60, Number(runSettings.videoDuration) || 5)),
            aspect_ratio: runSettings.videoAspect || '16:9',
            resolution: runSettings.videoResolution || '',
            images: refImages,
            videos: refVideos,
            audios: refAudios,
            enhance_prompt: Boolean(runSettings.videoEnhancePrompt),
            enable_upsample: Boolean(runSettings.videoEnableUpsample),
            watermark: Boolean(runSettings.videoWatermark),
            camerafixed: Boolean(runSettings.videoCameraFixed),
            generate_audio: Boolean(runSettings.videoGenerateAudio),
            multimodal: Boolean(runSettings.videoMultimodal),
            trusted_asset: useAssetUris
        };
        const result = await fetch('/api/canvas-video', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(payload)
        }).then(async r => { if(!r.ok) throw new Error(await smartResponseErrorMessage(r, tr('smart.errRunFailed'))); return r.json(); });
        if(result && result.jimeng_pending) throw new JimengPendingSignal({submitId:result.submit_id, kind:result.kind || 'video', queueInfo:result.queue_info, message:result.message});
        return resultMediaUrls(result);
    } finally {
        transientSmartCloudLinks = [];
    }
}
async function runModelscopeGeneration(prompt, refs, runSettings=settings){
    const compressedPrompt = smartCompressPromptToBudget(prompt, SMART_IMAGE_PROMPT_BUDGET);
    smartNotifyPromptCompression(compressedPrompt);
    prompt = compressedPrompt.prompt;
    refs = imageRefsOnly(refs);
    const modelKey = runSettings.msgenModel || 'zimage';
    const msModel = MS_GEN_MODELS[modelKey] || MS_GEN_MODELS.zimage;
    if(msModel.supportsImage && !refs.length) throw new Error(tr('smart.errMsNeedRefs'));
    const size = apiImageSize(runSettings.msRatio || 'square', runSettings.msResolution || '1k', runSettings.msCustomRatio || '', runSettings.msCustomSize || '');
    const parsed = parseSizeValue(size);
    const width = Number(parsed?.width) || 1024;
    const height = Number(parsed?.height) || 1024;
    const imageUrls = [];
    if(msModel.supportsImage || msModel.acceptsImage){
        for(const ref of refs.slice(0, SMART_REFERENCE_IMAGE_MAX)){
            if(ref.url) imageUrls.push(await urlToBase64(ref.url).catch(() => ref.url));
        }
    }
    const count = Math.max(1, Math.min(8, Number(runSettings.count || 1)));
    const submit = async () => {
        let body;
        if(modelKey === 'zimage') body = {prompt, resolution:`${width}x${height}`};
        else if(modelKey === 'qwen_edit') body = {prompt, image_urls:imageUrls, resolution:`${width}x${height}`};
        else body = {prompt, model:modelKey === 'custom' ? (runSettings.msCustomModel || modelscopeImageModels()[0]) : msModel.modelId, image_urls:imageUrls, width, height, size:`${width}x${height}`};
        const data = await fetch(msModel.endpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)}).then(async r => {
            if(!r.ok) throw new Error(await r.text());
            return r.json();
        });
        return data.url || data.images?.[0] || '';
    };
    const results = await Promise.all(Array.from({length:count}, submit));
    return results.filter(Boolean);
}
async function urlToBase64(url){
    const res = await fetch(url);
    if(!res.ok) throw new Error(tr('smart.errImageRead'));
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }
function smartPendingTasks(node){
    if(!node || !Array.isArray(node.pendingTasks)) return [];
    return node.pendingTasks.filter(task => task && task.taskId);
}
function cancelSmartNodeTasks(node){
    smartPendingTasks(node).forEach(task => {
        if(task.taskId) cancelledSmartTaskIds.add(task.taskId);
        if(task.recoverTaskId) cancelledSmartTaskIds.add(task.recoverTaskId);
    });
    if(node?.jimengPending?.submitId) cancelledSmartTaskIds.add(node.jimengPending.submitId);
    if(node){
        node.running = false;
        node.pending = 0;
        delete node.pendingTasks;
        delete node.jimengPending;
    }
}
function isSmartTaskCancelled(taskId){
    return Boolean(taskId && cancelledSmartTaskIds.has(taskId));
}
function isGeneratedSmartOutputNode(node){
    return Boolean(
        node &&
        isSmartImageNode(node) &&
        (
            node.autoBranchOutputSourceId ||
            node.sourceNodeId ||
            node.runAt ||
            node.runModelPrompt ||
            smartPendingTasks(node).length ||
            (node.images || []).some(img => img?.generatedResult)
        )
    );
}
class JimengPendingSignal extends Error {
    constructor(info){
        const data = info || {};
        super(data.message || '即梦任务排队中，可继续等待或手动查询');
        this.jimengPending = true;
        this.submitId = data.submitId || data.submit_id || '';
        this.kind = data.kind || 'image';
        this.queueInfo = data.queueInfo || data.queue_info || {};
    }
}
class ImageTaskRecoverSignal extends Error {
    constructor(info){
        const data = info || {};
        super(data.message || '任务未丢失，可稍后手动查询结果');
        this.imageTaskRecover = true;
        this.taskId = data.taskId || data.task_id || '';
        this.recoverTaskId = data.recoverTaskId || data.upstream_task_id || data.task_id || '';
        this.providerId = data.providerId || data.provider_id || '';
        this.kind = data.kind || 'image';
    }
}
function extractUpstreamTaskId(text){
    const match = String(text || '').match(/(?:task_id|taskId|task id)\s*[=:：]\s*([A-Za-z0-9_.:-]+)/i);
    return match ? match[1] : '';
}
const activeJimengPolls = new Set();
const JIMENG_POLL_INTERVAL = 60000;
const JIMENG_POLL_MAX = 1440;
function jimengQueueText(queueInfo){
    const qi = queueInfo || {};
    const idx = qi.queue_idx;
    const len = qi.queue_length;
    if(idx != null && len != null) return `即梦云端排队中（第 ${idx}/${len} 位）`;
    return '即梦云端生成中';
}
function setNodeJimengPending(node, signal){
    if(!node || !signal || !signal.submitId) return;
    const prev = node.jimengPending && node.jimengPending.submitId === signal.submitId ? node.jimengPending : null;
    node.jimengPending = {
        submitId:signal.submitId,
        kind:signal.kind || (prev && prev.kind) || 'image',
        queueInfo:signal.queueInfo || (prev && prev.queueInfo) || {},
        message:signal.message || (prev && prev.message) || '',
        startedAt:(prev && prev.startedAt) || nowMs(),
        updatedAt:nowMs(),
        querying:prev ? prev.querying : false
    };
    node.running = false;
    node.pending = 0;
    delete node.pendingTasks;
    if(!node.runStartedAt) node.runStartedAt = node.jimengPending.startedAt;
    delete node.runFinishedAt;
    delete node.runElapsedMs;
    node.runTimerHidden = false;
    render();
    scheduleSave();
    startJimengPoll(node);
}
function handleJimengPendingSignal(node, e){
    if(!(e && e.jimengPending && e.submitId)) return false;
    setNodeJimengPending(node, e);
    toast((e.message || jimengQueueText(e.queueInfo)).slice(0, 160));
    return true;
}
function finalizeJimengPending(node, urls, kind='image'){
    if(!node) return false;
    const ext = kind === 'video' ? 'mp4' : kind === 'audio' ? 'mp3' : kind === 'text' ? 'txt' : 'png';
    const additions = (urls || []).map((item, i) => {
        const url = typeof item === 'string' ? item : item?.url || '';
        const itemKind = (typeof item === 'object' && item.kind) || kind;
        return stripImageGenerationMeta(copyMediaSizeFields(item, {url, name:(typeof item === 'object' && item.name) || `output-${i + 1}.${ext}`, kind:itemKind, generatedResult:true}));
    }).filter(item => item.url);
    if(!additions.length) return false;
    delete node.jimengPending;
    replaceOutputsToNodeWithHistory(node, additions, kind, null, {skipShift:true});
    node.running = false;
    node.pending = 0;
    node.runFinishedAt = nowMs();
    if(!node.runStartedAt) node.runStartedAt = node.runFinishedAt;
    node.runElapsedMs = Math.max(0, node.runFinishedAt - Number(node.runStartedAt || node.runFinishedAt));
    node.runTimerHidden = false;
    render();
    scheduleSave();
    return true;
}
function applyJimengQueryResult(node, data){
    if(!node || !data) return false;
    if(data.status === 'succeeded'){
        const kind = data.kind || node.jimengPending?.kind || 'image';
        return finalizeJimengPending(node, data.urls || [], kind);
    }
    if(data.status === 'failed'){
        delete node.jimengPending;
        node.running = false;
        node.pending = 0;
        toast((data.error || '即梦任务失败').slice(0, 160));
        render();
        scheduleSave();
        return true;
    }
    if(node.jimengPending){
        node.jimengPending.queueInfo = data.queue_info || node.jimengPending.queueInfo || {};
        node.jimengPending.message = data.message || node.jimengPending.message || '';
        node.jimengPending.updatedAt = nowMs();
    }
    render();
    scheduleSave();
    return false;
}
async function fetchJimengQuery(submitId, kind){
    return fetch('/api/jimeng/query-media', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({submit_id:submitId, kind:kind || 'image'})
    }).then(async r => { if(!r.ok) throw new Error(await r.text()); return r.json(); });
}
async function queryJimengNow(nodeId){
    const node = nodes.find(n => n.id === nodeId);
    if(!node || !node.jimengPending || !node.jimengPending.submitId) return;
    if(node.jimengPending.querying) return;
    const submitId = node.jimengPending.submitId;
    const kind = node.jimengPending.kind || 'image';
    node.jimengPending.querying = true;
    render();
    try {
        const data = await fetchJimengQuery(submitId, kind);
        applyJimengQueryResult(node, data);
    } catch(e){
        toast((e.message || '查询失败').slice(0, 160));
    } finally {
        if(node.jimengPending) node.jimengPending.querying = false;
        render();
    }
}
function providerIdForSmartTask(node, task){
    return task?.providerId || node?.runSettings?.provider_id || settings.provider_id || 'comfly';
}
function sizeForSmartTask(node, task){
    const taskSize = task?.size || task?.requestedSize || '';
    if(taskSize) return taskSize;
    if(node?.runSettings) return sizeForRun(node.runSettings);
    return sizeForRun(settings);
}
async function fetchImageTaskQuery(providerId, taskId, size=''){
    return fetch('/api/image-task-query', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({provider_id:providerId || 'comfly', task_id:taskId, size:size || ''})
    }).then(async r => {
        if(!r.ok) throw new Error(await r.text());
        return r.json();
    });
}
async function querySmartImageTaskNow(nodeId, localTaskId){
    const node = nodes.find(n => n.id === nodeId);
    if(!node) return;
    const task = smartPendingTasks(node).find(item => item.taskId === localTaskId) || smartRecoverableImageTask(node);
    if(!task || task.querying) return;
    const recoverTaskId = task.recoverTaskId || extractUpstreamTaskId(task.error || '');
    if(!recoverTaskId){
        toast('没有任务 ID，无法查询');
        return;
    }
    task.querying = true;
    task.recoverTaskId = recoverTaskId;
    render();
    try {
        const data = await fetchImageTaskQuery(providerIdForSmartTask(node, task), recoverTaskId, sizeForSmartTask(node, task));
        if(data.status === 'succeeded'){
            task.failed = false;
            task.querying = false;
            finalizeSmartPendingTask(node, task.taskId, resultMediaUrls(data.images?.length ? data.images : data), task.kind || 'image');
            render();
            scheduleSave();
            return;
        }
        if(data.status === 'failed'){
            task.error = data.error || tr('smart.errRunFailed');
            toast(task.error.slice(0, 160));
        } else {
            task.error = data.message || '任务仍在生成中，请稍后再查询';
            toast(task.error);
        }
    } catch(e){
        task.error = e.message || '查询失败';
        toast(task.error.slice(0, 160));
    } finally {
        const latest = smartPendingTasks(node).find(item => item.taskId === localTaskId);
        if(latest) latest.querying = false;
        render();
        scheduleSave();
    }
}
function startJimengPoll(node){
    if(!node || !node.jimengPending || !node.jimengPending.submitId) return;
    const submitId = node.jimengPending.submitId;
    if(activeJimengPolls.has(submitId)) return;
    activeJimengPolls.add(submitId);
    const nodeId = node.id;
    (async () => {
        try {
            for(let i = 0; i < JIMENG_POLL_MAX; i++){
                await new Promise(resolve => setTimeout(resolve, JIMENG_POLL_INTERVAL));
                const cur = nodes.find(n => n.id === nodeId);
                if(!cur || !cur.jimengPending || cur.jimengPending.submitId !== submitId) return;
                if(cur.jimengPending.querying) continue;
                let data;
                try {
                    data = await fetchJimengQuery(submitId, cur.jimengPending.kind || 'image');
                } catch(err){ continue; }
                const done = applyJimengQueryResult(cur, data);
                if(done) return;
                const after = nodes.find(n => n.id === nodeId);
                if(!after || !after.jimengPending || after.jimengPending.submitId !== submitId) return;
            }
        } finally {
            activeJimengPolls.delete(submitId);
        }
    })();
}
function resumeJimengPendingNodes(){
    nodes.filter(n => n && n.jimengPending && n.jimengPending.submitId).forEach(n => {
        n.jimengPending.querying = false;
        startJimengPoll(n);
    });
}
async function pollSmartCanvasTask(taskId){
    if(!taskId) throw new Error(tr('smart.errRunFailed'));
    if(activeSmartTaskPolls.has(taskId)) return activeSmartTaskPolls.get(taskId);
    const promise = (async () => {
        for(let i = 0; i < 900; i++){
            await new Promise(resolve => setTimeout(resolve, 2000));
            const task = await fetch(`/api/canvas-image-tasks/${encodeURIComponent(taskId)}`).then(async r => {
                if(!r.ok) throw new Error(await r.text());
                return r.json();
            });
            if(task.status === 'succeeded') return task.result || {};
            if(task.status === 'jimeng_pending') throw new JimengPendingSignal({submitId:task.submit_id, kind:task.kind, queueInfo:task.queue_info, message:task.message});
            if(task.status === 'failed'){
                const recoverTaskId = task.upstream_task_id || extractUpstreamTaskId(task.error || '');
                if(recoverTaskId) throw new ImageTaskRecoverSignal({taskId, recoverTaskId, providerId:task.provider_id, kind:'image', message:task.error || tr('smart.errRunFailed')});
                throw new Error(task.error || tr('smart.errRunFailed'));
            }
        }
        throw new Error(tr('smart.errRunTimeout'));
    })();
    activeSmartTaskPolls.set(taskId, promise);
    try {
        return await promise;
    } finally {
        activeSmartTaskPolls.delete(taskId);
    }
}
function finalizeSmartPendingTask(node, taskId, images, kind='image'){
    if(!node || !taskId) return;
    if(isSmartTaskCancelled(taskId) || !nodes.some(n => n.id === node.id)) return;
    node.pendingTasks = smartPendingTasks(node).filter(task => task.taskId !== taskId);
    node.pending = Math.max(0, Number(node.pending || 0) - 1);
    const ext = kind === 'video' ? 'mp4' : kind === 'audio' ? 'mp3' : kind === 'text' ? 'txt' : 'png';
    const mediaItems = resultMediaUrls(images);
    const additions = (mediaItems || []).map((item, i) => {
        const url = typeof item === 'string' ? item : item?.url || '';
        const itemKind = (typeof item === 'object' && item.kind) || kind;
        return stripImageGenerationMeta(copyMediaSizeFields(item, {url, name:(typeof item === 'object' && item.name) || `output-${i + 1}.${ext}`, kind:itemKind, generatedResult:true}));
    }).filter(item => item.url);
    node.images = [...nonPreviewOutputImages(node.images).map(img => stripImageGenerationMeta({...img})), ...additions];
    if(additions.length) node.outputKind = kind;
    if(!node.pending && smartPendingTasks(node).length === 0){
        delete node.pendingTasks;
        node.runFinishedAt = nowMs();
        if(!node.runStartedAt) node.runStartedAt = node.runFinishedAt;
        node.runElapsedMs = Math.max(0, node.runFinishedAt - Number(node.runStartedAt || node.runFinishedAt));
        node.runTimerHidden = false;
        node.running = false;
        node.title = node.images.length > 1 ? (kind === 'video' ? 'Videos' : kind === 'audio' ? 'Audios' : kind === 'text' ? 'Texts' : 'Group') : (kind === 'video' ? 'Video' : kind === 'audio' ? 'Audio' : kind === 'text' ? 'Text' : 'Image');
        if(node.images.length > 1 && (!Number.isFinite(Number(node.scale)) || Number(node.scale) === MEDIA_NODE_DEFAULT_SCALE || Number(node.scale) === MEDIA_GROUP_PREVIOUS_DEFAULT_SCALE)) node.scale = MEDIA_GROUP_DEFAULT_SCALE;
        else node.scale = mediaNodeDefaultScale(node);
        clearSmartNodeExplicitSize(node);
    }
}
async function resumeSmartPendingNode(node){
    const tasks = smartPendingTasks(node);
    if(!node || !tasks.length) return;
    node.pending = Math.max(tasks.length, Number(node.pending || 0) || tasks.length);
    node.running = false;
    render();
    const failures = [];
    await Promise.all(tasks.map(async task => {
        if(task.failed && task.recoverTaskId) return;
        try {
            const result = await pollSmartCanvasTask(task.taskId);
            if(isSmartTaskCancelled(task.taskId) || !nodes.some(n => n.id === node.id)) return;
            finalizeSmartPendingTask(node, task.taskId, resultMediaUrls(result?.images?.length ? result.images : result), task.kind || 'image');
            render();
            scheduleSave();
        } catch(e) {
            if(isSmartTaskCancelled(task.taskId) || !nodes.some(n => n.id === node.id)) return;
            if(e && e.jimengPending && e.submitId){
                node.pendingTasks = smartPendingTasks(node).filter(item => item.taskId !== task.taskId);
                setNodeJimengPending(node, e);
                render();
                scheduleSave();
                return;
            }
            if(e && e.imageTaskRecover && e.recoverTaskId){
                task.failed = true;
                task.querying = false;
                task.recoverTaskId = e.recoverTaskId;
                task.providerId = e.providerId || task.providerId || providerIdForSmartTask(node, task);
                task.error = e.message || tr('smart.errRunFailed');
                node.running = false;
                node.pending = Math.max(1, smartPendingTasks(node).length);
                toast('任务未丢失，可稍后手动查询结果');
                render();
                scheduleSave();
                return;
            }
            node.pendingTasks = smartPendingTasks(node).filter(item => item.taskId !== task.taskId);
            node.pending = Math.max(0, Number(node.pending || 0) - 1);
            if(!node.pending && smartPendingTasks(node).length === 0){
                delete node.pendingTasks;
                node.running = false;
                if(!(node.images || []).length){
                    closeFailedEmptyRunNode(node);
                }
            }
            failures.push(e);
            toast((e.message || tr('smart.errRunFailed')).slice(0, 160));
            render();
            scheduleSave();
            await saveCanvas();
        }
    }));
    if(failures.length && !(node.images || []).length){
        throw failures[0];
    }
}
function resumeSmartPendingTasks(){
    nodes.filter(node => smartPendingTasks(node).length).forEach(node => {
        resumeSmartPendingNode(node).catch(() => {
            render();
            scheduleSave();
        });
    });
}
function updateSelectionBox(event){
    if(!selectionState) return;
    const sx = selectionState.startScreen.x, sy = selectionState.startScreen.y;
    const x = Math.min(sx, event.clientX), y = Math.min(sy, event.clientY);
    const shellRect = shell.getBoundingClientRect();
    selectionBox.style.display = 'block';
    selectionBox.style.left = `${x - shellRect.left}px`;
    selectionBox.style.top = `${y - shellRect.top}px`;
    selectionBox.style.width = `${Math.abs(event.clientX - sx)}px`;
    selectionBox.style.height = `${Math.abs(event.clientY - sy)}px`;
}
function finishSelection(event){
    if(!selectionState) return;
    const a = selectionState.startWorld;
    const b = screenToWorld(event);
    const minX = Math.min(a.x, b.x), minY = Math.min(a.y, b.y);
    const maxX = Math.max(a.x, b.x), maxY = Math.max(a.y, b.y);
    const moved = Math.abs(event.clientX - selectionState.startScreen.x) + Math.abs(event.clientY - selectionState.startScreen.y);
    const hitIds = moved < 4 ? [] : nodes.filter(node => {
        const r = nodeRect(node);
        return r.x < maxX && r.x + r.width > minX && r.y < maxY && r.y + r.height > minY;
    }).map(n => n.id);
    const nextIds = selectionState.additive ? [...new Set([...selectedNodeIds(), ...hitIds])] : hitIds;
    selectNodeIds(nextIds);
    selectedImage = {nodeId:'', index:-1};
    selectionState = null;
    selectionJustFinished = true;
    selectionBox.style.display = 'none';
    render();
    setTimeout(() => { selectionJustFinished = false; }, 0);
}
function orderedSelectedNodesForLink(){
    return selectedSmartNodes()
        .filter(node => node && !isHistoryGroupNode(node))
        .sort((a, b) => {
            const ar = nodeRect(a), br = nodeRect(b);
            const ax = Number(ar.x) || 0, bx = Number(br.x) || 0;
            const ay = Number(ar.y) || 0, by = Number(br.y) || 0;
            if(Math.abs(ax - bx) > 48) return ax - bx;
            return ay - by;
        });
}
function preferredLinkTargetForSelected(nodesToLink){
    const promptTargets = nodesToLink.filter(node => node.type === 'smart-prompt' || node.type === 'smart-loop');
    if(promptTargets.length === 1) return promptTargets[0];
    return null;
}
function linkSelectedNodes(){
    const selected = orderedSelectedNodesForLink();
    if(selected.length < 2){ toast('请选择至少两个要链接的节点'); return false; }
    pushUndo();
    const hub = preferredLinkTargetForSelected(selected);
    let changed = false;
    if(hub){
        selected.filter(node => node.id !== hub.id).forEach(node => {
            if(connectInputNode(node.id, hub.id)) changed = true;
        });
    }else{
        for(let i = 0; i < selected.length - 1; i++){
            if(connectInputNode(selected[i].id, selected[i + 1].id)) changed = true;
        }
    }
    if(!changed){
        discardPendingUndo?.();
        toast('这些节点已经链接过了');
        return false;
    }
    selectNodeIds(selected.map(node => node.id));
    render();
    scheduleSave();
    toast(hub ? '已链接到提示词节点' : '已按位置链接选中节点');
    return true;
}
function groupSelectedNodes(){
    const ids = selectedIds.length ? selectedIds.slice() : (selectedId ? [selectedId] : []);
    const selected = ids.map(id => nodes.find(n => n.id === id)).filter(n => n && !isSmartGroupNode(n));
    if(selected.length < 2){ toast('请选择至少两个要编组的节点'); return false; }
    pushUndo();
    const rects = selected.map(nodeRect);
    const minX = Math.min(...rects.map(r => r.x));
    const minY = Math.min(...rects.map(r => r.y));
    const maxX = Math.max(...rects.map(r => r.x + r.width));
    const maxY = Math.max(...rects.map(r => r.y + r.height));
    const padX = 32;
    const padTop = 64;
    const padBottom = 28;
    const group = {
        id:uid('group'),
        type:'smart-group',
        groupMode:'frame',
        x:Math.round(minX - padX),
        y:Math.round(minY - padTop),
        w:Math.max(360, Math.round(maxX - minX + padX * 2)),
        h:Math.max(240, Math.round(maxY - minY + padTop + padBottom)),
        title:'编组',
        groupNote:'',
        items:selected.map(node => node.id),
        images:[],
        created_at:Date.now()
    };
    nodes.forEach(node => {
        if(isSmartGroupNode(node) && Array.isArray(node.items)) node.items = node.items.filter(id => !group.items.includes(id));
    });
    nodes.push(group);
    selectedIds = [];
    selectedId = group.id;
    selectedImage = {nodeId:'', index:-1};
    render();
    scheduleSave();
    return true;
}
function ungroupNode(groupId){
    const group = nodes.find(n => n.id === groupId);
    if(!group) return false;
    // 释放智能分组：把收进卡片的图片重新拆成独立图片节点（平铺在分组原位置），提示词/循环成员原地保留，再删除分组容器。
    if(isSmartGroupNode(group)){
        pushUndo();
        const memberIds = smartGroupMembers(group).map(m => m.id);
        const groupImages = (group.images || []).filter(img => img?.url);
        let created = [];
        if(groupImages.length){
            const layout = imageLayout(group.images || [], nodeScale(group), group);
            const pad = 16, gap = 8;
            const cell = Math.max(28, Math.round(layout.thumb || 96));
            const cols = Math.max(1, layout.cols || 1);
            created = groupImages.map((img, index) => {
                const col = index % cols;
                const row = Math.floor(index / cols);
                const size = thumbDisplaySize(img, cell);
                const x = Math.round(Number(group.x || 0) + pad + col * (cell + gap) + Math.max(0, (cell - size.width) / 2));
                const y = Math.round(Number(group.y || 0) + pad + row * (cell + gap) + Math.max(0, (cell - size.height) / 2));
                const node = {id:uid('smart'), type:'smart-image', x, y, w:size.width, h:size.height, title:'Image', images:[stripImageGenerationMeta({...img})], scale:MEDIA_NODE_DEFAULT_SCALE, created_at:Date.now()};
                inheritNodeMetaFromImage(node);
                clearDetachedRunInputRefs(node);
                return node;
            });
        }
        nodes = nodes.filter(n => n.id !== groupId);
        nodes.push(...created);
        if(canvas) canvas.connections = (canvas.connections || []).filter(c => c.from !== groupId && c.to !== groupId);
        nodes.forEach(node => {
            if(Array.isArray(node.inputNodeIds)) node.inputNodeIds = node.inputNodeIds.filter(id => id !== groupId);
            if(isSmartGroupNode(node) && Array.isArray(node.items)) node.items = node.items.filter(id => id !== groupId);
        });
        selectedIds = [...created.map(n => n.id), ...memberIds].filter(id => nodes.some(n => n.id === id));
        selectedId = selectedIds.length === 1 ? selectedIds[0] : '';
        selectedImage = {nodeId:'', index:-1};
        render();
        scheduleSave();
        return true;
    }
    if(!Array.isArray(group.images) || group.images.length < 2) return false;
    pushUndo();
    const layout = imageLayout(group.images || [], nodeScale(group), group);
    const pad = 16;
    const gap = 8;
    const cell = Math.max(28, Math.round(layout.thumb || 96));
    const created = (group.images || []).map((img, index) => {
        const col = index % Math.max(1, layout.cols || 1);
        const row = Math.floor(index / Math.max(1, layout.cols || 1));
        const size = thumbDisplaySize(img, cell);
        const x = Math.round(Number(group.x || 0) + pad + col * (cell + gap) + Math.max(0, (cell - size.width) / 2));
        const y = Math.round(Number(group.y || 0) + pad + row * (cell + gap) + Math.max(0, (cell - size.height) / 2));
        const node = {
            id:uid('smart'),
            type:'smart-image',
            x,
            y,
            w:size.width,
            h:size.height,
            title:'Image',
            images:[stripImageGenerationMeta({...img})],
            scale:MEDIA_NODE_DEFAULT_SCALE,
            created_at:Date.now()
        };
        inheritNodeMetaFromImage(node);
        clearDetachedRunInputRefs(node);
        return node;
    });
    nodes = nodes.filter(n => n.id !== groupId);
    nodes.push(...created);
    if(canvas) canvas.connections = (canvas.connections || []).filter(c => c.from !== groupId && c.to !== groupId);
    nodes.forEach(node => {
        if(Array.isArray(node.inputNodeIds)){
            node.inputNodeIds = node.inputNodeIds.filter(inputId => inputId !== groupId);
        }
    });
    selectedIds = created.map(node => node.id);
    selectedId = selectedIds.length === 1 ? selectedIds[0] : '';
    selectedImage = {nodeId:'', index:-1};
    render();
    scheduleSave();
    return true;
}
function mergeImageNodesIntoGroup(sourceId, targetId){
    const source = nodes.find(n => n.id === sourceId);
    const target = nodes.find(n => n.id === targetId);
    if(!source || !target || source.id === target.id) return false;
    if(!(source.images || []).length || !(target.images || []).length) return false;
    const sourceImages = (source.images || []).map(img => stripImageGenerationMeta({...img}));
    target.images = [...(target.images || []).map(img => stripImageGenerationMeta(img)), ...sourceImages];
    target.title = 'Group';
    if(!Number.isFinite(Number(target.scale)) || Number(target.scale) === MEDIA_NODE_DEFAULT_SCALE) target.scale = MEDIA_GROUP_DEFAULT_SCALE;
    delete target.w;
    delete target.h;
    canvas.connections = (canvas.connections || []).map(c => {
        if(c.from === source.id) return {...c, from:target.id};
        if(c.to === source.id) return {...c, to:target.id};
        return c;
    }).filter((c, index, arr) => c.from !== c.to && arr.findIndex(x => x.from === c.from && x.to === c.to && (x.kind || 'flow') === (c.kind || 'flow')) === index);
    nodes.forEach(node => {
        if(Array.isArray(node.inputNodeIds)){
            node.inputNodeIds = Array.from(new Set(node.inputNodeIds.map(id => id === source.id ? target.id : id).filter(id => id !== node.id)));
        }
    });
    nodes = nodes.filter(n => n.id !== source.id);
    selectedIds = [];
    selectedId = target.id;
    selectedImage = {nodeId:'', index:-1};
    return true;
}
function smartGroupTargetForDraggedNode(draggedNode){
    // 允许把一个分组拖进另一个分组（拖来的分组的成员会作为输入并入目标分组）。自身/被拖分组及其成员已在 excluded 中排除。
    if(!draggedNode) return null;
    const r = nodeRect(draggedNode);
    const excluded = new Set([draggedNode.id, ...(dragState?.groupIds || [])]);
    const cx = r.x + r.width / 2;
    const cy = r.y + r.height / 2;
    const groups = nodes
        .filter(node => isSmartGroupNode(node) && !excluded.has(node.id))
        .map(group => ({group, rect:nodeRect(group)}))
        .filter(item => cx >= item.rect.x && cx <= item.rect.x + item.rect.width && cy >= item.rect.y && cy <= item.rect.y + item.rect.height);
    if(!groups.length) return null;
    groups.sort((a, b) => (nodes.indexOf(b.group) - nodes.indexOf(a.group)));
    return groups[0].group;
}
function addDraggedNodeToSmartGroup(draggedNode, group){
    return addDraggedNodesToSmartGroup(draggedNode ? [draggedNode] : [], group);
}
// 把一个或多个被拖动的节点批量加入目标分组（支持多选拖入）。入组后只整理一次并选中目标分组。
function addDraggedNodesToSmartGroup(draggedNodes, group){
    if(!group || !isSmartGroupNode(group)) return false;
    const list = (draggedNodes || []).filter(n => n && n.id !== group.id);
    if(!list.length) return false;
    let added = false;
    list.forEach(n => {
        if(addNodeToSmartGroup(group, n)) added = true;
    });
    if(!added) return false;
    if(isSmartFrameGroup(group)){
        selectedIds = [];
        selectedId = group.id;
        selectedImage = {nodeId:'', index:-1};
        return true;
    }
    // 提示词/循环成员入组后自动整理成网格（图片已收进卡片网格，自动平铺）。
    arrangeSmartGroupMembers(group, {skipUndo:true});
    selectedIds = [];
    // 图片被吸收进分组（原节点已删除），统一选中目标分组；仅当单个提示词/循环节点拖入时保持选中它。
    const survivingSingle = list.length === 1 && nodes.some(n => n.id === list[0].id) ? list[0].id : '';
    selectedId = survivingSingle || group.id;
    selectedImage = {nodeId:'', index:-1};
    return true;
}
function closeCreateMenu(){
    createMenu?.classList.remove('open');
    createMenuGroupId = '';
}
function closeCanvasContextMenu(){
    if(!canvasContextMenu) return;
    canvasContextMenu.hidden = true;
    canvasContextMenu.innerHTML = '';
}
function canvasContextMenuHtml(items){
    return items.map(item => {
        if(item.separator) return '<div class="context-menu-separator"></div>';
        return `<button class="context-menu-item ${item.danger ? 'danger' : ''}" type="button" data-context-action="${escapeAttr(item.action)}" ${item.disabled ? 'disabled' : ''}>
            <i data-lucide="${escapeAttr(item.icon || 'circle')}"></i><span>${escapeHtml(item.label || '')}</span>
        </button>`;
    }).join('');
}
function openCanvasContextMenu(event){
    if(!canvasContextMenu) return;
    closeCreateMenu();
    contextMenuPoint = screenToWorld(event);
    const ids = selectedNodeIds();
    const selected = selectedSmartNodes();
    const hasSelection = ids.length > 0;
    const selectedGroups = selected.filter(isSmartGroupNode);
    const canGroup = selected.filter(node => !isSmartGroupNode(node)).length > 1;
    const canUngroup = selectedGroups.length > 0;
    const canPaste = Boolean(nodeClipboard?.nodes?.length || imageClipboard?.item?.url || navigator.clipboard?.readText);
    const items = [
        {action:'copy', icon:'copy', label:'复制', disabled:!hasSelection},
        {action:'paste', icon:'clipboard-paste', label:'粘贴', disabled:!canPaste},
        {separator:true},
        {action:'group', icon:'group', label:'编组选中节点', disabled:!canGroup},
        {action:'ungroup', icon:'ungroup', label:'取消编组', disabled:!canUngroup},
        {action:'arrange', icon:'layout-grid', label:'自动排列', disabled:!hasSelection},
        {separator:true},
        {action:'delete', icon:'trash-2', label:'删除选中节点', disabled:!hasSelection, danger:true}
    ];
    canvasContextMenu.innerHTML = canvasContextMenuHtml(items);
    const w = 210;
    const h = 310;
    const left = Math.max(12, Math.min(window.innerWidth - w - 12, event.clientX + 8));
    const top = Math.max(12, Math.min(window.innerHeight - h - 12, event.clientY + 8));
    canvasContextMenu.style.left = `${left}px`;
    canvasContextMenu.style.top = `${top}px`;
    canvasContextMenu.hidden = false;
    refreshIcons();
}
async function handleCanvasContextAction(action){
    closeCanvasContextMenu();
    if(action === 'copy') return copySelectedNodes();
    if(action === 'paste'){
        if(contextMenuPoint) lastMouseWorld = {...contextMenuPoint};
        if(nodeClipboard?.nodes?.length) return pasteNodes();
        if(imageClipboard?.item?.url) return pasteImageClipboard();
        if(await pasteSmartNodeClipboardFromSystem()) return;
        toast('剪贴板中没有可粘贴的模块');
        return;
    }
    if(action === 'group') return groupSelectedNodes();
    if(action === 'ungroup'){
        const ids = selectedNodeIds();
        const ok = ids.map(id => ungroupNode(id)).some(Boolean);
        if(!ok) toast('没有可取消的分组');
        return;
    }
    if(action === 'arrange') return arrangeSelectedNodes();
    if(action === 'delete') return deleteSelectedNodes();
}
function openCreateMenu(event, options={}){
    if(!createMenu) return;
    closeCanvasContextMenu();
    createMenuPoint = screenToWorld(event);
    createMenuGroupId = options.groupId || '';
    const w = 500;
    const h = 114;
    const left = Math.max(14, Math.min(window.innerWidth - w - 14, event.clientX + 8));
    const top = Math.max(14, Math.min(window.innerHeight - h - 14, event.clientY + 8));
    createMenu.style.left = `${left}px`;
    createMenu.style.top = `${top}px`;
    createMenu.classList.add('open');
    refreshIcons();
}
function addCreatedNodeToMenuGroup(node){
    const group = createMenuGroupId ? nodes.find(n => n.id === createMenuGroupId) : null;
    if(addNodeToSmartGroup(group, node)){
        // 通过分组小菜单新建的节点入组后自动整理（节点创建已压过 undo，这里不再重复）。
        arrangeSmartGroupMembers(group, {skipUndo:true});
        render();
        scheduleSave();
    }
}
function createNodeFromMenu(type){
    const p = createMenuPoint || viewportCenter();
    const groupId = createMenuGroupId;
    closeCreateMenu();
    if(type === 'group') return createSmartGroupNode(p.x - 170, p.y - 110);
    let created = null;
    if(type === 'prompt') created = createPromptNode(p.x - 158, p.y - 97);
    else if(type === 'loop') created = createLoopNode(p.x - 135, p.y - 95);
    else created = createImageNodeAt(p);
    createMenuGroupId = groupId;
    addCreatedNodeToMenuGroup(created);
    createMenuGroupId = '';
    return created;
}
shell.addEventListener('mousedown', e => {
    if(!zoomPreviewState) return;
    if(e.button !== 0) return;
    if(e.target.closest('.composer,.smart-back,.asset-panel,.asset-toggle,.smart-log-toggle,.smart-shortcut-toggle,.log-modal,.shortcut-modal,.image-edit-modal,.create-menu,.smart-minimap')) return;
    e.preventDefault();
    e.stopPropagation();
}, true);
shell.addEventListener('click', e => {
    if(!zoomPreviewState) return;
    if(e.button !== 0) return;
    if(e.target.closest('.composer,.smart-back,.asset-panel,.asset-toggle,.smart-log-toggle,.smart-shortcut-toggle,.log-modal,.shortcut-modal,.image-edit-modal,.create-menu,.smart-minimap')) return;
    e.preventDefault();
    e.stopPropagation();
    const nodeEl = e.target.closest('.image-node');
    if(nodeEl?.dataset?.id) exitZoomPreviewToNode(nodeEl.dataset.id);
    else exitZoomPreview(screenToWorld(e));
}, true);
shell.onmousedown = e => {
    if(zoomPreviewState && e.button === 0 && !e.target.closest('.composer,.smart-back,.asset-panel,.asset-toggle,.smart-log-toggle,.smart-shortcut-toggle,.log-modal,.shortcut-modal,.image-edit-modal,.create-menu,.smart-minimap')) return;
    if(e.target.closest('.image-node,.composer,.smart-back,.asset-panel,.asset-toggle,.smart-log-toggle,.smart-shortcut-toggle,.log-modal,.shortcut-modal,.create-menu,.canvas-context-menu,.smart-minimap')) return;
    closeCreateMenu();
    closeCanvasContextMenu();
    if(e.button === 0 && !isSpaceKeyDown){
        e.preventDefault();
        didPan = false;
        selectionState = {startScreen:{x:e.clientX, y:e.clientY}, startWorld:screenToWorld(e), additive:e.shiftKey};
        updateSelectionBox(e);
        return;
    }
    if(e.button !== 0 && e.button !== 1) return;
    e.preventDefault();
    didPan = false;
    panState = {button:e.button, startX:e.clientX, startY:e.clientY, ox:viewport.x, oy:viewport.y};
    shell.classList.add('panning');
};
shell.oncontextmenu = e => {
    if((e.ctrlKey || e.metaKey) || isRKeyDown){
        e.preventDefault();
        e.stopPropagation();
        return;
    }
    if(didPan || e.target.closest('.composer,.smart-back,.asset-panel,.asset-toggle,.smart-log-toggle,.smart-shortcut-toggle,.log-modal,.shortcut-modal,.image-edit-modal,.create-menu,.smart-minimap')) return;
    if(document.getElementById('imageEditModal')?.classList.contains('open')) return;
    e.preventDefault();
    e.stopPropagation();
    closeCanvasContextMenu();
    const nodeEl = e.target.closest('.image-node');
    if(nodeEl?.dataset?.id){
        const id = nodeEl.dataset.id;
        if(!isNodeSelected(id)){
            selectedId = id;
            selectedIds = [];
        }
        selectedImage = {nodeId:'', index:-1};
        render();
        openCanvasContextMenu(e);
        return;
    }
    if(selectedNodeIds().length || nodeClipboard?.nodes?.length || imageClipboard?.item?.url){
        openCanvasContextMenu(e);
        return;
    }
    openCreateMenu(e);
};
shell.ondblclick = e => {
    if(didPan || e.target.closest('.image-node,.composer,.smart-back,.asset-panel,.asset-toggle,.smart-log-toggle,.smart-shortcut-toggle,.log-modal,.shortcut-modal,.image-edit-modal,.create-menu')) return;
    if(document.getElementById('imageEditModal')?.classList.contains('open')) return;
    e.preventDefault();
    openCreateMenu(e);
};
shell.onclick = e => {
    if(selectionJustFinished) return;
    if(didPan || e.target.closest('.image-node,.composer,.smart-back,.asset-panel,.asset-toggle,.smart-log-toggle,.smart-shortcut-toggle,.log-modal,.shortcut-modal,.image-edit-modal,.create-menu,.canvas-context-menu')) return;
    if(document.getElementById('imageEditModal')?.classList.contains('open')) return;
    closeCreateMenu();
    closeCanvasContextMenu();
    clearSelection();
    render();
};
canvasContextMenu?.addEventListener('click', e => {
    const btn = e.target.closest('[data-context-action]');
    if(!btn || btn.disabled) return;
    e.preventDefault();
    e.stopPropagation();
    handleCanvasContextAction(btn.dataset.contextAction || '');
});
minimap?.addEventListener('mousedown', e => {
    if(e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    smartMinimapDrag = true;
    centerViewportOnWorldPoint(minimapEventToWorld(e));
});
window.onmousemove = e => {
    lastMouseWorld = screenToWorld(e);
    if(smartMinimapDrag){
        e.preventDefault();
        centerViewportOnWorldPoint(minimapEventToWorld(e));
        return;
    }
    if(portDragState){
        e.preventDefault();
        const p = screenToWorld(e);
        portDragState.currentWorld = p;
        portDragState.moved = true;
        const hitEl = document.elementFromPoint(e.clientX, e.clientY);
        const portEl = hitEl?.closest?.('.node-port');
        const nodeEl = portEl?.closest?.('.image-node') || hitEl?.closest?.('.image-node');
        let targetId = '', targetPort = '';
        if(nodeEl && nodeEl.dataset.id && nodeEl.dataset.id !== portDragState.fromId){
            targetId = nodeEl.dataset.id;
            if(portEl){
                targetPort = portEl.dataset.port;
            } else {
                const rect = nodeEl.getBoundingClientRect();
                targetPort = (e.clientX - rect.left) < rect.width / 2 ? 'in' : 'out';
            }
            const compatible = (portDragState.fromPort === 'out' && targetPort === 'in') || (portDragState.fromPort === 'in' && targetPort === 'out');
            if(!compatible){ targetId = ''; targetPort = ''; }
        }
        portDragState.hoverTargetId = targetId;
        portDragState.hoverPort = targetPort;
        updatePortDragVisual();
        return;
    }
    if(promptResizeState){
        e.preventDefault();
        const dy = e.clientY - promptResizeState.startY;
        settings.promptH = Math.max(60, Math.min(380, promptResizeState.startH + dy));
        promptInput.style.setProperty('--prompt-h', `${settings.promptH}px`);
        persistActiveSmartSettings();
        return;
    }
    if(selectionState){
        e.preventDefault();
        updateSelectionBox(e);
        return;
    }
    if(previewCompareDrag){
        e.preventDefault();
        setPreviewComparePos(e.clientX);
        return;
    }
    if(panoramaState.drag){
        e.preventDefault();
        const dx = e.clientX - panoramaState.drag.clientX;
        const dy = e.clientY - panoramaState.drag.clientY;
        panoramaState.yaw = panoramaState.drag.yaw - dx * 0.18;
        panoramaState.pitch = Math.max(-85, Math.min(85, panoramaState.drag.pitch + dy * 0.18));
        document.getElementById('previewStage')?.classList.add('panning');
        return;
    }
    if(previewPanDrag){
        const stage = document.getElementById('previewStage');
        previewPan = {
            x:previewPanDrag.startX + (e.clientX - previewPanDrag.clientX),
            y:previewPanDrag.startY + (e.clientY - previewPanDrag.clientY)
        };
        stage?.classList.add('panning');
        applyPreviewTransform();
        return;
    }
    if(imageEditPanDrag){
        const stage = document.getElementById('imageEditStage');
        if(stage){
            stage.scrollLeft = imageEditPanDrag.scrollLeft - (e.clientX - imageEditPanDrag.clientX);
            stage.scrollTop = imageEditPanDrag.scrollTop - (e.clientY - imageEditPanDrag.clientY);
        }
        return;
    }
    if(cropDrag && cropState){
        const dx = e.clientX - cropDrag.sx;
        const dy = e.clientY - cropDrag.sy;
        if(cropDrag.mode === 'move'){
            cropState.x = cropDrag.start.x + dx;
            cropState.y = cropDrag.start.y + dy;
        } else if(cropDrag.mode === 'image'){
            cropState.x = cropDrag.start.x + dx;
            cropState.y = cropDrag.start.y + dy;
        } else if(String(cropDrag.mode || '').startsWith('outpaint-')){
            resizeOutpaintFromDrag(dx, dy);
        } else {
            cropState.w = cropDrag.start.w + dx;
            cropState.h = cropDrag.start.h + dy;
        }
        clampCrop();
        renderCropBox();
        return;
    }
    if(resizeState){
        const node = nodes.find(n => n.id === resizeState.id);
        if(!node) return;
        const dx = (e.clientX - resizeState.startX) / viewport.scale;
        const dy = (e.clientY - resizeState.startY) / viewport.scale;
        const minW = node.type === 'smart-prompt' ? 260 : node.type === 'smart-loop' ? 252 : node.type === 'smart-group' ? SMART_GROUP_MIN_WIDTH : 48;
        const minH = node.type === 'smart-prompt' ? 170 : node.type === 'smart-loop' ? 132 : node.type === 'smart-group' ? SMART_GROUP_MIN_HEIGHT : 48;
        if(isSmartFrameGroup(node)){
            node.w = Math.max(minW, Math.round(resizeState.startW + dx));
            node.h = Math.max(minH, Math.round(resizeState.startH + dy));
            node.scale = 1;
            updateNodeElementDuringResize(node);
            return;
        }
        if(node.type === 'smart-group' && smartGroupImageRefs(node).some(ref => ref.item?.url)){
            // 图片分组：和普通节点一样直接改 w/h，缩略图网格按新尺寸实时重排。不要走下面的“成员缩放”那套，
            // 否则拖动过程里会按成员包围盒/缩放比例收缩，松手才回到拖动宽度（用户反馈的“变宽时先缩小”）。
            node.w = Math.max(minW, Math.round(resizeState.startW + dx));
            node.h = Math.max(minH, Math.round(resizeState.startH + dy));
            if(smartGroupCompactMembers(node).length) arrangeSmartGroupMembers(node, {skipUndo:true, syncDom:true});
            updateNodeElementDuringResize(node);
            return;
        }
        if(node.type === 'smart-group'){
            // 分组当“画布中的画布”：拖手柄按宽度方向算出统一缩放比例，组内所有成员（图片+提示词）按相对手势
            // 起点的快照整体缩放+重排，然后把分组框自动收紧到成员的包围盒——盒子始终贴合内容，右侧不会留空白。
            const startZoom = resizeState.startZoom || 1;
            // 目标框宽 = 手柄拖出的框宽；缩放映射以“贴合内容的框宽”为基准，保证两个阶段都线性跟随手柄、衔接连续。
            const targetW = resizeState.startW + dx;
            const fitBase = resizeState.contentFitW || resizeState.startW || 1;
            const desiredZoom = startZoom * (targetW / fitBase);
            // 成员缩放上限 SMART_GROUP_MAX_MEMBER_ZOOM（默认 1=原始尺寸）：到上限就不再放大成员，改为让分组框继续扩大。
            const effectiveZoom = Math.max(0.2, Math.min(SMART_GROUP_MAX_MEMBER_ZOOM, desiredZoom));
            const memberRatio = effectiveZoom / startZoom;
            const capped = desiredZoom > SMART_GROUP_MAX_MEMBER_ZOOM;
            node._memberZoom = effectiveZoom;
            const gx = Number(node.x) || 0, gy = Number(node.y) || 0;
            const SMART_GROUP_PAD = 16;
            let maxRight = gx, maxBottom = gy, hasMember = false;
            (resizeState.members || []).forEach(snap => {
                const member = nodes.find(n => n.id === snap.id);
                if(!member) return;
                hasMember = true;
                member.x = gx + (snap.sx - gx) * memberRatio;
                member.y = gy + (snap.sy - gy) * memberRatio;
                member.w = Math.max(40, Math.round(snap.sw * memberRatio));
                member.h = Math.max(40, Math.round(snap.sh * memberRatio));
                if(snap.isImage) member.scale = 1;
                maxRight = Math.max(maxRight, member.x + member.w);
                maxBottom = Math.max(maxBottom, member.y + member.h);
                const memberEl = world.querySelector(`.image-node[data-id="${CSS.escape(member.id)}"]`);
                if(memberEl){
                    memberEl.style.left = `${member.x}px`;
                    memberEl.style.top = `${member.y}px`;
                }
                updateNodeElementDuringResize(member);
            });
            if(capped || !hasMember){
                // 成员已到上限（或空分组）：分组框随手柄继续扩大，成员不再放大。
                node.w = Math.max(minW, Math.round(resizeState.startW + dx));
                node.h = Math.max(minH, Math.round(resizeState.startH + dy));
            } else {
                // 未到上限：分组框收紧到成员包围盒，贴合内容无空白。
                node.w = Math.max(minW, Math.round(maxRight - gx + SMART_GROUP_PAD));
                node.h = Math.max(minH, Math.round(maxBottom - gy + SMART_GROUP_PAD));
            }
            node.scale = 1;
            updateNodeElementDuringResize(node);
            return;
        }
        node.w = Math.max(minW, Math.round(resizeState.startW + dx));
        node.h = Math.max(minH, Math.round(resizeState.startH + dy));
        node.scale = 1;
        updateNodeElementDuringResize(node);
        return;
    }
    if(llmInstructionResizeState){
        const node = nodes.find(n => n.id === llmInstructionResizeState.id);
        if(!node) return;
        const dy = (e.clientY - llmInstructionResizeState.startY) / viewport.scale;
        const newInstrH = Math.max(PROMPT_LLM_INSTRUCTION_MIN_H, Math.min(PROMPT_LLM_INSTRUCTION_MAX_H, Math.round(llmInstructionResizeState.startH + dy)));
        node.llmInstructionHeight = newInstrH;
        // 只把“指令框的高度变化量”叠加到节点总高度上，保留用户手动拉大的上方区域，避免上方被重置变小。
        node.h = Math.max(promptNodeExpandedHeight(node), Math.round(llmInstructionResizeState.startNodeH + (newInstrH - llmInstructionResizeState.startH)));
        node.w = Math.max(Number(node.w) || 0, 316);
        node.scale = 1;
        updateNodeElementDuringResize(node);
        const ta = world.querySelector(`.image-node[data-id="${CSS.escape(node.id)}"] .prompt-llm-instruction`);
        if(ta) ta.style.height = `${promptLlmInstructionHeight(node)}px`;
        return;
    }
    if(promptSplitResizeState){
        const node = nodes.find(n => n.id === promptSplitResizeState.id);
        if(!node) return;
        const dy = (e.clientY - promptSplitResizeState.startY) / viewport.scale;
        const newPreviewH = Math.max(PROMPT_SPLIT_PREVIEW_MIN_H, Math.min(PROMPT_SPLIT_PREVIEW_MAX_H, Math.round(promptSplitResizeState.startH + dy)));
        node.promptSplitPreviewHeight = newPreviewH;
        node.h = Math.max(promptNodeMinHeight(node), Math.round(promptSplitResizeState.startNodeH + (newPreviewH - promptSplitResizeState.startH)));
        node.w = Math.max(Number(node.w) || 0, 316);
        node.scale = 1;
        updateNodeElementDuringResize(node);
        const list = world.querySelector(`.image-node[data-id="${CSS.escape(node.id)}"] .prompt-node-segments`);
        if(list) list.style.height = `${promptNodeSplitPreviewHeight(node)}px`;
        return;
    }
    if(thumbDragState){
        const dx = e.clientX - thumbDragState.startX;
        const dy = e.clientY - thumbDragState.startY;
        const source = nodes.find(n => n.id === thumbDragState.nodeId);
        if(!thumbDragState.detached && Math.abs(dx) + Math.abs(dy) > 6){
            const canDetachThumb = source && (isSmartGroupNode(source) ? (source.images || []).length >= 1 : (source.images || []).length > 1);
            if(canDetachThumb){
                const img = source.images[thumbDragState.imgIndex];
                if(img){
                    commitPendingUndo();
                    undoSuppressed = true;
                    applyNodeMetaToImage(img, source);
                    source.images.splice(thumbDragState.imgIndex, 1);
                    if(isSmartGroupNode(source)){
                        arrangeSmartGroupMembers(source, {skipUndo:true, syncDom:true});
                    } else if(source.images.length <= 1){
                        source.title = 'Image';
                        delete source.w; delete source.h;
                        inheritNodeMetaFromImage(source);
                    }
                    const point = screenToWorld(e);
                    selectedId = '';
                    selectedImage = {nodeId:'', index:-1};
                    const newNode = createImageNodeAt(point, [img], {select:false, skipUndo:true});
                    undoSuppressed = false;
                    dragState = {id:newNode.id, startX:e.clientX, startY:e.clientY, ox:newNode.x, oy:newNode.y, thumbDetached:true};
                    thumbDragState.detached = true;
                    render();
                }
            }
        }
        if(thumbDragState.detached) thumbDragState = null;
        else return;
    }
    if(panState){
        const dx = e.clientX - panState.startX;
        const dy = e.clientY - panState.startY;
        if(Math.abs(dx) + Math.abs(dy) > 3) didPan = true;
        viewport.x = panState.ox + dx;
        viewport.y = panState.oy + dy;
        applyViewport();
        return;
    }
    if(!dragState) return;
    const node = nodes.find(n => n.id === dragState.id);
    if(!node) return;
    const moveDx = (e.clientX - dragState.startX) / viewport.scale;
    const moveDy = (e.clientY - dragState.startY) / viewport.scale;
    (dragState.group || [{id:dragState.id, ox:dragState.ox, oy:dragState.oy}]).forEach(item => {
        const n = nodes.find(x => x.id === item.id);
        if(!n) return;
        n.x = item.ox + moveDx;
        n.y = item.oy + moveDy;
    });
    if(assetLibraryOpen){
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        if(hit && assetPanel?.contains(hit)){
            setAssetDragOver(true);
            clearDropHighlight();
            setAssetDragOver(true);
            return;
        }
        setAssetDragOver(false);
    }
    const draggedRect = nodeRect(node);
    const rawTarget = dragState.ctrlGroup
        ? (['smart-prompt','smart-loop'].includes(node.type)
            ? dragConnectTargetFor(node, screenToWorld(e))
            : rectOverlapNode(node.id, draggedRect.x, draggedRect.y, draggedRect.width, draggedRect.height, dragState.groupIds))
        : null;
    const target = isSmartGroupNode(rawTarget) ? null : rawTarget;
    setDropHighlight(target?.id || '');
    moveNodeElementsDuringDrag();
    updateLoopInsertPreview();
    if(target) setDropHighlight(target.id);
};
window.onmouseup = e => {
    document.body.classList.remove('smart-node-drag');
    document.body.classList.remove('smart-node-resize');
    if(portDragState){
        const drag = portDragState;
        portDragState = null;
        shell.classList.remove('port-dragging');
        clearPortDragVisual();
        handlePortDrop(drag, e);
        return;
    }
    if(promptResizeState){ promptResizeState = null; scheduleSave(); }
    if(selectionState) finishSelection(e);
    if(previewCompareDrag) previewCompareDrag = false;
    if(panoramaState.drag){
        panoramaState.drag = null;
        document.getElementById('previewStage')?.classList.remove('panning');
    }
    if(previewPanDrag){
        previewPanDrag = null;
        document.getElementById('previewStage')?.classList.remove('panning');
    }
    if(imageEditPanDrag) imageEditPanDrag = null;
    if(cropDrag){
        document.getElementById('cropCanvas')?.classList.remove('dragging-image');
        cropDrag = null;
    }
    if(resizeState){
        const node = nodes.find(n => n.id === resizeState.id);
        const rect = node ? nodeRect(node) : null;
        const changed = rect && (Math.abs(rect.width - resizeState.startW) > 1 || Math.abs(rect.height - resizeState.startH) > 1);
        if(changed){
            commitPendingUndo();
        } else { discardPendingUndo(); }
        resizeState = null;
        if(changed) render();
        scheduleSave();
    }
    if(llmInstructionResizeState){
        const node = nodes.find(n => n.id === llmInstructionResizeState.id);
        const changed = node && promptLlmInstructionHeight(node) !== llmInstructionResizeState.startH;
        document.body.classList.remove('smart-node-resize', 'smart-llm-instr-resize');
        if(changed) commitPendingUndo(); else discardPendingUndo();
        llmInstructionResizeState = null;
        render();
        scheduleSave();
    }
    if(promptSplitResizeState){
        const node = nodes.find(n => n.id === promptSplitResizeState.id);
        const changed = node && promptNodeSplitPreviewHeight(node) !== promptSplitResizeState.startH;
        document.body.classList.remove('smart-node-resize', 'smart-prompt-split-resize');
        if(changed) commitPendingUndo(); else discardPendingUndo();
        promptSplitResizeState = null;
        render();
        scheduleSave();
    }
    if(thumbDragState){
        if(!thumbDragState.detached) discardPendingUndo();
        thumbDragState = null;
    }
    if(panState) {
        panState = null;
        shell.classList.remove('panning');
        scheduleSave();
        setTimeout(() => { didPan = false; }, 0);
    }
    if(smartMinimapDrag){
        smartMinimapDrag = false;
    }
    if(dragState){
        const draggedNode = nodes.find(n => n.id === dragState.id);
        let stateChanged = false;
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        const droppedOnAssetPanel = assetLibraryOpen && hit && assetPanel?.contains(hit);
        if(droppedOnAssetPanel && draggedNode && (draggedNode.images || []).length){
            const imagesToSave = (draggedNode.images || []).filter(img => img?.url);
            imagesToSave.forEach(img => addUrlToAssetLibrary(img.url, img.name || draggedNode.title || 'image'));
            (dragState.group || [{id:dragState.id, ox:dragState.ox, oy:dragState.oy}]).forEach(item => {
                const n = nodes.find(x => x.id === item.id);
                if(n){ n.x = item.ox; n.y = item.oy; }
            });
            setAssetDragOver(false);
            discardPendingUndo();
            clearDropHighlight();
            dragState = null;
            document.body.classList.remove('smart-node-drag');
            render();
            scheduleSave();
            return;
        }
        const autoTarget = draggedNode && dragState.ctrlGroup ? dragConnectTargetFor(draggedNode, screenToWorld(e)) : null;
        const insertHit = draggedNode?.type === 'smart-loop' && dragState.ctrlGroup && (dragState.group || []).length <= 1
            ? insertionConnectionForNode(draggedNode)
            : null;
        const draggedRect = draggedNode ? nodeRect(draggedNode) : null;
        const groupTarget = draggedNode && (draggedNode.images || []).length && (dragState.group || []).length <= 1 && draggedRect
            ? rectOverlapNode(draggedNode.id, draggedRect.x, draggedRect.y, draggedRect.width, draggedRect.height, dragState.groupIds)
            : null;
        // 拖入分组：单个节点、多选（批量拖入）或整个分组（其成员会并入目标分组）都允许并入主分组下的目标分组。
        // 目标分组由主拖动节点的中心命中决定；smartGroupTargetForDraggedNode 已排除正在被拖动的节点/分组。
        const draggedNodes = (dragState.group || []).map(item => nodes.find(n => n.id === item.id)).filter(Boolean);
        const smartGroupTarget = draggedNode ? smartGroupTargetForDraggedNode(draggedNode) : null;
        if(
            insertHit &&
            insertLoopNodeIntoConnection(draggedNode, insertHit)
        ){
            stateChanged = true;
            render();
        } else if(
            smartGroupTarget &&
            addDraggedNodesToSmartGroup(draggedNodes.length ? draggedNodes : [draggedNode], smartGroupTarget)
        ){
            stateChanged = true;
            render();
        } else if(
            groupTarget &&
            dragState.ctrlGroup &&
            (groupTarget.images || []).length > 1 &&
            mergeImageNodesIntoGroup(draggedNode.id, groupTarget.id)
        ){
            stateChanged = true;
            render();
        } else if(
            draggedNode &&
            autoTarget &&
            dragState.ctrlGroup &&
            (dragState.group || []).length <= 1 &&
            canAutoConnectDraggedNode(draggedNode, autoTarget) &&
            connectInputNode(draggedNode.id, autoTarget.id)
        ){
            stateChanged = true;
            restoreDraggedNodePosition();
            if(selectedId === draggedNode.id) selectedId = '';
            render();
        } else if(draggedNode && (draggedNode.images || []).length && (dragState.group || []).length <= 1){
            const r = nodeRect(draggedNode);
            const target = rectOverlapNode(draggedNode.id, r.x, r.y, r.width, r.height, dragState.groupIds);
            if(target && isSmartGroupNode(target)){
                if((dragState.group || []).some(item => {
                    const n = nodes.find(x => x.id === item.id);
                    return n && (Math.abs((Number(n.x) || 0) - item.ox) > 1 || Math.abs((Number(n.y) || 0) - item.oy) > 1);
                })) stateChanged = true;
            } else if(target && dragState.ctrlGroup && !isSmartGroupNode(target) && canAutoConnectDraggedNode(draggedNode, target)){
                stateChanged = true;
                connectInputNode(draggedNode.id, target.id);
                if(!dragState.thumbDetached) restoreDraggedNodePosition();
                if(selectedId === draggedNode.id) selectedId = '';
                render();
            } else if((dragState.group || []).some(item => {
                const n = nodes.find(x => x.id === item.id);
                return n && (Math.abs((Number(n.x) || 0) - item.ox) > 1 || Math.abs((Number(n.y) || 0) - item.oy) > 1);
            })){
                stateChanged = true;
            }
        } else if((dragState.group || []).some(item => {
            const n = nodes.find(x => x.id === item.id);
            return n && (Math.abs((Number(n.x) || 0) - item.ox) > 1 || Math.abs((Number(n.y) || 0) - item.oy) > 1);
        }) || (draggedNode && (Math.abs((draggedNode.x || 0) - dragState.ox) > 1 || Math.abs((draggedNode.y || 0) - dragState.oy) > 1))){
            stateChanged = true;
        }
        if(dragState.thumbDetached) stateChanged = true;
        // 拖出（没落到任何分组上）：普通节点退出所在分组；子分组退出时把它并入过的成员从主分组里撤掉。
        if(draggedNode && !smartGroupTarget && pruneSmartGroupMembershipsForNode(draggedNode)){
            stateChanged = true;
            render();
        }
        if(stateChanged) commitPendingUndo();
        else discardPendingUndo();
        if(stateChanged || dragState.thumbDetached) suppressNodeClickUntil = Date.now() + 180;
        clearDropHighlight();
        loopInsertPreview = null;
        dragState = null;
        scheduleSave();
        scheduleConnectionLayerRefresh();
    }
};
shell.addEventListener('wheel', e => {
    if(e.target.closest('.composer,.smart-back,.image-edit-modal,.asset-panel,.asset-toggle,.smart-log-toggle,.smart-shortcut-toggle,.log-modal,.shortcut-modal,.smart-group-list,[data-thumb-scroll]')) return;
    if(isFocusedWheelEditableTarget(e.target)) return;
    e.preventDefault();
    const rect = shell.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const before = {x:(sx - viewport.x) / viewport.scale, y:(sy - viewport.y) / viewport.scale};
    const factor = Math.exp(-e.deltaY * 0.001);
    viewport.scale = safeScale(viewport.scale * factor);
    viewport.x = sx - before.x * viewport.scale;
    viewport.y = sy - before.y * viewport.scale;
    applyViewport();
    scheduleSave();
}, {passive:false});
shell.ondragover = e => setSmartDropCopyEffect(e, true);
shell.ondrop = async e => {
    e.preventDefault();
    if(e.target.closest('.image-node')) return;
    const p = screenToWorld(e);
    const assetRaw = e.dataTransfer.getData('application/x-smart-asset');
    if(assetRaw){
        try {
            const asset = JSON.parse(assetRaw);
            if(asset?.url) {
                pushUndo();
                createImageNodeAt(p, [assetNodeImageFromItem(asset)], {skipUndo:true});
            }
            return;
        } catch {}
    }
    const payload = await resolveSmartImageDropPayload(e.dataTransfer);
    if(payload.type === 'none') return;
    await handleSmartImageDropPayload(payload, '', {point:p, forceNew:true});
};
window.addEventListener('paste', e => {
    const files = [...(e.clipboardData?.files || [])].filter(isSupportedUploadFile);
    if(files.length){
        lastImagePasteAt = Date.now();
        handleFiles(files, selectedId);
        return;
    }
    // 素材库管理页「复制到画布」过来的素材：Ctrl+V 批量粘贴成图片节点
    if(!isEditableTarget(e.target) && pasteAssetsFromInbox()){
        e.preventDefault();
        return;
    }
    if(!isEditableTarget(e.target)){
        const text = e.clipboardData?.getData('text/plain') || '';
        const smartClip = parseSmartNodeClipboardText(text);
        if(setSmartNodeClipboardPayload(smartClip)){
            e.preventDefault();
            pasteNodes();
            return;
        }
    }
    if(imageClipboard?.item?.url && !isEditableTarget(e.target)){
        e.preventDefault();
        pasteImageClipboard();
        return;
    }
    if(nodeClipboard?.nodes?.length && !isEditableTarget(e.target)){
        e.preventDefault();
        pasteNodes();
    }
});
window.addEventListener('keydown', e => {
    const key = String(e.key || '').toLowerCase();
    if(key === 'r' && !isEditableTarget(e.target)) isRKeyDown = true;
    if(e.code === 'Space' && !isEditableTarget(e.target)){
        isSpaceKeyDown = true;
        shell.classList.add('space-pan-ready');
        e.preventDefault();
    }
    if(imageEditModal.classList.contains('open') && imageEditMode === 'preview' && !isEditableTarget(e.target)){
        if(e.key === 'ArrowLeft' || e.key === 'ArrowRight'){
            e.preventDefault();
            if(!seekPreviewVideoFrames(e.key === 'ArrowLeft' ? -1 : 1)){
                navigatePreviewImage(e.key === 'ArrowLeft' ? -1 : 1);
            }
            return;
        }
    }
    if(!e.ctrlKey && !e.metaKey && !e.altKey && !isEditableTarget(e.target)){
        if(key === 'z'){
            if(e.repeat) return;
            e.preventDefault();
            toggleZoomPreview();
            return;
        }
        if(key === 'a'){
            if(e.repeat) return;
            e.preventDefault();
            toggleAssetLibrary();
            return;
        }
    }
    if((e.ctrlKey || e.metaKey) && key === 'c' && !isEditableTarget(e.target)){
        const selectionText = window.getSelection?.().toString() || '';
        if(selectionText) return;
        e.preventDefault();
        if(copySelectedNodes()) return;
        copySelectedImage();
        return;
    }
    if(e.key === 'Escape' && imageEditModal.classList.contains('open')){
        closeImageEditor();
        return;
    }
    if(e.key === 'Escape' && canvasContextMenu && !canvasContextMenu.hidden){
        closeCanvasContextMenu();
        return;
    }
    if((e.ctrlKey || e.metaKey) && key === 'z' && !isEditableTarget(e.target)){
        e.preventDefault();
        performUndo();
        return;
    }
    if((e.key === 'Delete' || e.key === 'Backspace') && (selectedId || selectedIds.length) && !isEditableTarget(e.target)){
        e.preventDefault();
        deleteSelectedNodes();
    }
    if((e.ctrlKey || e.metaKey) && e.shiftKey && key === 'g' && !isEditableTarget(e.target)){
        e.preventDefault();
        const ids = selectedIds.length ? selectedIds.slice() : (selectedId ? [selectedId] : []);
        const ok = ids.map(id => ungroupNode(id)).some(Boolean);
        if(ok) return;
    }
    if((e.ctrlKey || e.metaKey) && key === 'g' && !e.shiftKey && !isEditableTarget(e.target)){
        e.preventDefault();
        groupSelectedNodes();
    }
});
window.addEventListener('keyup', e => {
    if(String(e.key || '').toLowerCase() === 'r') isRKeyDown = false;
    if(e.code === 'Space'){
        isSpaceKeyDown = false;
        shell.classList.remove('space-pan-ready');
    }
});
window.addEventListener('blur', () => {
    isRKeyDown = false;
    isSpaceKeyDown = false;
    shell.classList.remove('space-pan-ready');
});
engineSelect.onchange = () => {
    settings.engine = normalizeSmartEngine(engineSelect.value);
    applyRecentSmartSettingsForCurrentMode();
    syncApiKindToggleVisibility();
    renderDynamicParams();
    persistActiveSmartSettings();
    scheduleSave();
};
function syncApiKindToggleVisibility(){
    if(!apiKindToggle) return;
    apiKindToggle.style.display = isApiLikeEngine(settings.engine) ? 'inline-flex' : 'none';
    apiKindToggle.querySelectorAll('[data-kind]').forEach(btn => btn.classList.toggle('active', btn.dataset.kind === (settings.apiKind || 'image')));
}
if(apiKindToggle){
    apiKindToggle.querySelectorAll('[data-kind]').forEach(btn => {
        btn.onclick = e => {
            e.preventDefault();
            e.stopPropagation();
            const kind = btn.dataset.kind;
            if(kind === settings.apiKind) return;
            settings.apiKind = kind;
            applyRecentSmartSettingsForCurrentMode();
            syncApiKindToggleVisibility();
            renderDynamicParams();
            persistActiveSmartSettings();
            scheduleSave();
        };
    });
}
let promptResizeState = null;
const promptResize = document.getElementById('promptResize');
if(promptResize){
    promptResize.addEventListener('mousedown', e => {
        if(e.button !== 0) return;
        e.preventDefault(); e.stopPropagation();
        promptResizeState = {
            startY: e.clientY,
            startH: Number(settings.promptH) || promptInput.offsetHeight || 124
        };
    });
}
runBtn.onclick = runGeneration;
if(composerPromptMatchBtn){
    composerPromptMatchBtn.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        matchComposerPromptFromText();
    };
}
if(cascadeRunBtn){
    cascadeRunBtn.onclick = () => {
        const node = selectedNode();
        const loopId = resolveSmartCascadeLoop(node?.id)?.node?.id || '';
        if(loopId && smartCascadeIsLoopRunning(loopId)) {
            requestSmartCascadeStop(loopId);
            return;
        }
        runSmartCascade();
    };
}
fileInput.onchange = () => {
    const groupPoint = pendingGroupUploadPoint;
    if(!fileInput.files?.length){
        pendingGroupUploadPoint = null;
        uploadTargetId = '';
        return;
    }
    const targetId = groupPoint ? '' : (uploadTargetId || selectedId);
    handleFiles(fileInput.files, targetId, groupPoint ? {point:groupPoint} : {});
    pendingGroupUploadPoint = null;
    uploadTargetId = '';
    fileInput.value = '';
};
if(assetToggle) assetToggle.onclick = () => toggleAssetLibrary();
if(assetCloseBtn) assetCloseBtn.onclick = () => toggleAssetLibrary(false);
assetPanel?.addEventListener('pointerdown', e => e.stopPropagation());
assetPanel?.addEventListener('mousedown', e => e.stopPropagation());
assetPanel?.addEventListener('click', e => e.stopPropagation());
assetPanel?.addEventListener('wheel', e => {
    e.stopPropagation();
    // 滚动时取消待显示的悬浮预览并隐藏，避免滚动中加载大图卡顿。
    clearTimeout(assetHoverTimer);
    hideAssetHoverPreview();
    const scroller = e.target.closest?.('.asset-grid') || assetGrid;
    if(!scroller || getComputedStyle(scroller).display === 'none') return;
    const canScroll = scroller.scrollHeight > scroller.clientHeight || scroller.scrollWidth > scroller.clientWidth;
    if(!canScroll) return;
    e.preventDefault();
    scroller.scrollTop += e.deltaY;
    scroller.scrollLeft += e.deltaX;
}, {passive:false, capture:true});
assetDialogBackdrop?.addEventListener('pointerdown', e => e.stopPropagation());
assetDialogBackdrop?.addEventListener('mousedown', e => e.stopPropagation());
assetDialogBackdrop?.addEventListener('click', e => e.stopPropagation());
promptPresetPanel?.addEventListener('pointerdown', e => e.stopPropagation());
promptPresetPanel?.addEventListener('mousedown', e => e.stopPropagation());
promptPresetPanel?.addEventListener('click', e => e.stopPropagation());
promptTemplatePanel?.addEventListener('pointerdown', e => e.stopPropagation());
promptTemplatePanel?.addEventListener('mousedown', e => e.stopPropagation());
promptTemplatePanel?.addEventListener('wheel', e => e.stopPropagation(), {passive:false});
promptTemplatePanel?.addEventListener('click', e => {
    e.stopPropagation();
    const apply = e.target.closest('[data-template-apply]');
    if(apply){ applyPromptTemplateToNode(apply.dataset.templateApply || 'positive'); return; }
    if(e.target.closest('[data-template-save-current]')){ saveCurrentPromptAsTemplate(); return; }
    if(e.target.closest('[data-template-new]')){ createBlankPromptTemplate(); return; }
    if(e.target.closest('[data-template-edit]')) { promptTemplateEditing = true; renderPromptTemplatePanel(); return; }
    if(e.target.closest('[data-template-edit-cancel]')) { promptTemplateEditing = false; renderPromptTemplatePanel(); return; }
    if(e.target.closest('[data-template-edit-save]')){ savePromptTemplateEdit(); return; }
    if(e.target.closest('[data-template-delete]')){ deletePromptTemplate(); return; }
    const cat = e.target.closest('[data-template-cat]');
    if(cat){
        promptTemplateCategory = cat.dataset.templateCat || 'all';
        promptTemplateSelectedId = '';
        promptTemplateEditing = false;
        renderPromptTemplatePanel({preserveScroll:false});
        return;
    }
    const catEdit = e.target.closest('[data-template-cat-edit]');
    if(catEdit){
        const id = catEdit.dataset.templateCatEdit || '';
        renamePromptTemplateGroup(id);
        return;
    }
    const catDelete = e.target.closest('[data-template-cat-delete]');
    if(catDelete){
        deletePromptTemplateGroup(catDelete.dataset.templateCatDelete || '');
        return;
    }
    if(e.target.closest('[data-template-group-edit]')){
        promptTemplateGroupEditMode = !promptTemplateGroupEditMode;
        renderPromptTemplatePanel({preserveScroll:false});
        return;
    }
    if(e.target.closest('[data-template-cat-new]')) { createPromptTemplateGroup(); return; }
    const card = e.target.closest('[data-template-id]');
    if(card){
        promptTemplateSelectedId = card.dataset.templateId || '';
        promptTemplateEditing = false;
        renderPromptTemplatePanel();
        return;
    }
});
if(promptPresetClose) promptPresetClose.onclick = closePromptPresetPanel;
if(promptTemplateClose) promptTemplateClose.onclick = closePromptTemplatePanel;
if(promptTemplateSearch) promptTemplateSearch.oninput = handlePromptTemplateSearchInput;
if(promptTemplateLibrarySelect) promptTemplateLibrarySelect.onchange = async () => {
    activePromptLibraryId = promptTemplateLibrarySelect.value || 'system';
    promptTemplateSelectedId = '';
    // 切换词库必须重置分类筛选，否则上一个库的分类（如系统的“视角”）会把新库内容过滤为空。
    promptTemplateCategory = 'all';
    promptTemplateEditing = false;
    // 拉取最新数据，确保素材库管理里新建/新增的词库与提示词在画布即时可见。
    const want = activePromptLibraryId;
    try { await loadPromptTemplates(); } catch(e){}
    if(promptLibraries.some(lib => lib.id === want)) activePromptLibraryId = want;
    renderPromptLibrarySelect();
    renderPromptTemplatePanel({preserveScroll:false});
};
if(composerTemplateBtn) composerTemplateBtn.onclick = event => {
    event.preventDefault();
    event.stopPropagation();
    if(promptTemplatePanel?.classList?.contains('open') && promptTemplatePanel.dataset.target === 'composer'){
        closePromptTemplatePanel();
        return;
    }
    openPromptTemplatePanel(activeComposerNode()?.id || selectedNode()?.id || '', promptTemplateSelectedId, {target:'composer'});
};
if(promptPresetSelect) promptPresetSelect.onchange = () => renderPromptPresetPanel(promptPresetSelect.value);
[promptPresetName, promptPresetText].forEach(input => {
    input?.addEventListener('input', () => {
        resetPromptPresetDeleteState();
        setPromptPresetStatus(tr('smart.promptPresetEditing'));
    });
});
if(promptPresetApply) promptPresetApply.onclick = () => {
    const preset = currentPromptPreset(promptPresetSelect.value);
    const node = promptPresetPanelNode();
    if(!preset || !node) return;
    node.promptPresetId = preset.id;
    node.text = preset.text || '';
    closePromptPresetPanel();
    render();
    scheduleSave();
};
if(promptPresetSave) promptPresetSave.onclick = () => {
    const preset = currentPromptPreset(promptPresetSelect.value);
    if(!preset) return;
    const name = promptPresetName.value.trim();
    const text = promptPresetText.value.trim();
    if(!name || !text){ setPromptPresetStatus(tr('smart.promptPresetRequired'), 'warn'); return; }
    const idx = promptPresets.findIndex(p => p.id === preset.id);
    if(idx >= 0) promptPresets[idx] = {...promptPresets[idx], name, text, updatedAt:Date.now()};
    savePromptPresets();
    const node = promptPresetPanelNode();
    if(node?.promptPresetId === preset.id) node.text = text;
    renderPromptPresetPanel(preset.id, tr('smart.promptPresetSaved'));
    setPromptPresetStatus(tr('smart.promptPresetSaved'), 'ok');
    render();
    scheduleSave();
};
if(promptPresetNew) promptPresetNew.onclick = () => {
    const node = promptPresetPanelNode();
    const preset = createPromptPresetFromNode(node, {openPanel:false});
    if(!preset) return;
    renderPromptPresetPanel(preset.id, tr('smart.promptPresetSavedNew'));
    setPromptPresetStatus(tr('smart.promptPresetSavedNew'), 'ok');
    promptPresetName?.focus();
    promptPresetName?.select();
};
if(promptPresetDelete) promptPresetDelete.onclick = () => {
    const preset = currentPromptPreset(promptPresetSelect.value);
    if(!preset) return;
    if(!promptPresetDeleteArmed){
        promptPresetDeleteArmed = true;
        promptPresetDelete.textContent = tr('smart.promptPresetDeleteAgain');
        promptPresetDelete.classList.add('confirm-danger');
        setPromptPresetStatus(tr('smart.promptPresetDeleteConfirm').replace('{name}', preset.name || tr('smart.promptPresetUnnamed')), 'warn');
        return;
    }
    promptPresets = promptPresets.filter(p => p.id !== preset.id);
    nodes.forEach(node => { if(node.promptPresetId === preset.id) node.promptPresetId = ''; });
    savePromptPresets();
    renderPromptPresetPanel(promptPresets[0]?.id || '', tr('smart.promptPresetDeleted'));
    setPromptPresetStatus(tr('smart.promptPresetDeleted'), 'ok');
    render();
    scheduleSave();
};
document.querySelectorAll('[data-asset-tab]').forEach(btn => {
    btn.onclick = () => {
        assetTab = btn.dataset.assetTab;
        renderAssetLibrary();
    };
});
if(assetLibrarySelect) assetLibrarySelect.onchange = () => {
    activeAssetLibraryId = assetLibrarySelect.value || '';
    activeAssetCategoryId = '';
    mentionAssetCategoryId = '';
    if(activeAssetLibraryId === LOCAL_ASSET_LIBRARY_ID) assetTab = 'image';
    renderAssetLibrary();
};
if(assetCategorySelect) assetCategorySelect.onchange = () => {
    activeAssetCategoryId = assetCategorySelect.value;
    renderAssetLibrary();
};
if(assetAddCategoryBtn) assetAddCategoryBtn.onclick = async () => {
    const fallbackName = tr('smart.assetFolder');
    const name = await openAssetNameDialog({title:tr('smart.assetNewFolder'), value:fallbackName, placeholder:fallbackName});
    if(!name) return;
    if(assetLibraryIsLocal()){
        const data = await fetch('/api/local-assets/folders', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({parent:localAssetFolderPath(), name})
        }).then(async r => {
            if(!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || '新建文件夹失败');
            return r.json();
        });
        setLocalAssetLibraryFromResponse(data);
        activeAssetCategoryId = data.folder?.path || activeAssetCategoryId;
        renderAssetLibrary();
        return;
    }
    const data = await fetch('/api/asset-library/categories', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({library_id:activeAssetLibraryId, name, type:'image'})}).then(r => r.json());
    setActiveAssetTabCategory(data.category?.id || '');
    setAssetLibraryFromResponse(data);
};
if(assetRenameCategoryBtn) assetRenameCategoryBtn.onclick = async () => {
    const cat = activeAssetTabCategory();
    if(!cat) return;
    const name = await openAssetNameDialog({title:tr('smart.assetRenameFolder'), value:cat.name || '', placeholder:tr('smart.assetFolder')});
    if(!name) return;
    if(assetLibraryIsLocal()){
        const data = await fetch('/api/local-assets/folders', {
            method:'PATCH',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({path:cat.id || '', name})
        }).then(async r => {
            if(!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || '重命名文件夹失败');
            return r.json();
        });
        setLocalAssetLibraryFromResponse(data);
        activeAssetCategoryId = data.folder?.path || activeAssetCategoryId;
        renderAssetLibrary();
        return;
    }
    const data = await fetch(`/api/asset-library/categories/${encodeURIComponent(cat.id)}`, {method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name})}).then(r => r.json());
    setAssetLibraryFromResponse(data);
};
function hasCanvasImageDrag(event){
    return Array.from(event.dataTransfer?.types || []).includes('application/x-smart-canvas-image');
}
function setAssetDragOver(active){
    if(!assetDropZone || !assetPanel) return;
    assetDropZone.classList.toggle('drag-over', !!active);
    assetPanel.classList.toggle('drag-over', !!active);
}
function handleAssetPanelDragOver(e){
    if(hasCanvasImageDrag(e) || hasSmartImageDropData(e.dataTransfer)){
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
        setAssetDragOver(true);
    }
}
async function handleAssetPanelDrop(e){
    if(!hasCanvasImageDrag(e) && !hasSmartImageDropData(e.dataTransfer)) return;
    e.preventDefault();
    e.stopPropagation();
    setAssetDragOver(false);
    const raw = e.dataTransfer.getData('application/x-smart-canvas-image');
    if(raw){
        try {
            const payload = JSON.parse(raw);
            if(payload?.url) await addUrlToAssetLibrary(payload.url, payload.name || '');
            return;
        } catch(e) {
            toast(tr('smart.assetAddFail'));
            return;
        }
    }
    try {
        const payload = await resolveSmartImageDropPayload(e.dataTransfer);
        if(payload.type === 'files') {
            if(assetLibraryIsLocal()) await addFilesToLocalAssetLibrary(payload.files);
            else {
                const uploaded = await uploadFiles(payload.files);
                for(const file of uploaded) if(file?.url) await addUrlToAssetLibrary(file.url, file.name || '');
            }
        } else if(payload.type === 'localPaths') {
            if(assetLibraryIsLocal()) await addLocalPathsToLocalAssetLibrary(payload.localPaths);
            else {
                const imported = await importSmartLocalImages(payload.localPaths);
                for(const file of imported) if(file?.url) await addUrlToAssetLibrary(file.url, file.name || '');
            }
        } else if(payload.type === 'url') {
            await addUrlToAssetLibrary(payload.url, smartImageNameFromUrl(payload.url));
        }
    } catch(err) {
        toast(err.message || tr('smart.assetAddFail'));
    }
}
assetDropZone?.addEventListener('dragover', e => {
    if(hasCanvasImageDrag(e) || hasSmartImageDropData(e.dataTransfer)){
        e.preventDefault();
        e.stopPropagation();
        assetDropZone?.classList.add('drag-over');
    }
});
assetDropZone?.addEventListener('dragleave', () => assetDropZone?.classList.remove('drag-over'));
assetDropZone?.addEventListener('drop', handleAssetPanelDrop);
assetPanel?.addEventListener('dragover', handleAssetPanelDragOver);
assetPanel?.addEventListener('dragleave', e => { if(!assetPanel?.contains(e.relatedTarget)) setAssetDragOver(false); });
assetPanel?.addEventListener('drop', handleAssetPanelDrop);
createMenu?.addEventListener('mousedown', event => event.stopPropagation());
createMenu?.addEventListener('click', event => {
    event.stopPropagation();
    const card = event.target.closest('[data-create-type]');
    if(card) createNodeFromMenu(card.dataset.createType || 'image');
});
composer.addEventListener('pointerdown', event => event.stopPropagation());
composer.addEventListener('mousedown', event => event.stopPropagation());
composer.addEventListener('click', event => {
    if(!event.target.closest('.smart-control')) closeAllSmartPopovers();
    event.stopPropagation();
});
promptInput.addEventListener('input', maybeOpenMentionPicker);
promptInput.addEventListener('input', () => {
    delete promptInput.dataset.preserveDraftOnce;
    syncComposerPromptMatchButton();
    savePromptDraftForCurrent();
    renderInputThumbsRow(selectedNode());
    scheduleSave();
});
promptInput.addEventListener('keyup', maybeOpenMentionPicker);
promptInput.addEventListener('mouseup', saveMentionRange);
promptInput.addEventListener('focus', saveMentionRange);
promptInput.addEventListener('keydown', event => {
    if(event.key === 'Escape') closeMentionPicker();
});
promptInput.addEventListener('mouseover', event => {
    const token = event.target.closest?.('.mention-image-token');
    if(!token) return;
    // 音频没有可预览的图像，不能把音频 URL 塞进 <img>（会显示破损图标），直接不弹悬浮预览。
    if(token.dataset.kind === 'audio'){ mentionPreview.style.display = 'none'; return; }
    let media = mentionPreview.querySelector('img,video');
    const isVideo = token.dataset.kind === 'video' || isVideoMediaItem({url:token.dataset.url, kind:token.dataset.kind});
    if(isVideo && media?.tagName?.toLowerCase() !== 'video'){
        media?.replaceWith(document.createElement('video'));
        media = mentionPreview.querySelector('video');
    } else if(!isVideo && media?.tagName?.toLowerCase() !== 'img'){
        media?.replaceWith(document.createElement('img'));
        media = mentionPreview.querySelector('img');
    }
    if(isVideo){
        media.muted = true;
        media.loop = true;
        media.playsInline = true;
        media.preload = 'metadata';
        media.disablePictureInPicture = true;
        media.setAttribute('disablepictureinpicture', '');
        media.setAttribute('controlslist', 'nodownload noplaybackrate noremoteplayback');
        media.src = token.dataset.url || '';
        media.play?.().catch(() => {});
    } else {
        media.src = token.dataset.url || '';
        media.alt = 'preview';
    }
    const rect = token.getBoundingClientRect();
    mentionPreview.style.left = `${Math.min(window.innerWidth - 236, rect.left)}px`;
    mentionPreview.style.top = `${Math.min(window.innerHeight - 236, rect.bottom + 8)}px`;
    mentionPreview.style.display = 'block';
});
promptInput.addEventListener('mouseout', event => {
    if(event.target.closest?.('.mention-image-token')){
        mentionPreview.style.display = 'none';
        const media = mentionPreview.querySelector('img,video');
        media?.pause?.();
        media?.removeAttribute('src');
        media?.load?.();
    }
});
mentionPicker.addEventListener('mousedown', event => event.stopPropagation());
document.addEventListener('click', event => {
    if(!event.target.closest('.smart-control')) closeAllSmartPopovers();
    if(!event.target.closest('.mention-picker') && !event.target.closest('#promptInput') && !event.target.closest('[data-input-add-reference]')) closeMentionPicker();
    if(!event.target.closest('.prompt-preset-panel') && !event.target.closest('.prompt-preset-edit') && !event.target.closest('.prompt-preset-save')) closePromptPresetPanel();
    if(!event.target.closest('.prompt-template-panel') && !event.target.closest('.prompt-preset-edit') && !event.target.closest('#composerTemplateBtn')) closePromptTemplatePanel();
});
document.addEventListener('keydown', event => {
    if(event.key === 'Escape') { closeSmartLogLightbox(); closeAllSmartPopovers(); closeCreateMenu(); closeSmartCanvasLog(); closeSmartCanvasShortcuts(); closePromptPresetPanel(); closePromptTemplatePanel(); }
});
document.getElementById('cropBox').addEventListener('mousedown', event => beginCropDrag(event, 'move'));
document.getElementById('cropHandle').addEventListener('mousedown', event => beginCropDrag(event, 'resize'));
document.getElementById('outpaintFrame').addEventListener('mousedown', event => {
    if(event.target.closest('[data-outpaint-handle]')) return;
    beginCropDrag(event, 'image');
});
document.querySelectorAll('[data-outpaint-handle]').forEach(handle => {
    handle.addEventListener('mousedown', event => beginCropDrag(event, `outpaint-${handle.dataset.outpaintHandle || 'corner'}`));
});
document.getElementById('cropImage').addEventListener('mousedown', event => {
    if(imageEditMode !== 'outpaint' || !cropState) return;
    document.getElementById('cropCanvas')?.classList.add('dragging-image');
    beginCropDrag(event, 'image');
});
document.querySelectorAll('[data-image-edit-mode]').forEach(btn => {
    btn.addEventListener('click', event => {
        event.stopPropagation();
        setImageEditMode(btn.dataset.imageEditMode || 'crop', true);
    });
});
imageEditModal.addEventListener('pointerdown', event => {
    event.stopPropagation();
});
imageEditModal.addEventListener('mousedown', event => {
    event.stopPropagation();
});
imageEditModal.addEventListener('mousemove', event => {
    if(previewPanDrag || previewCompareDrag || panoramaState.drag || imageEditPanDrag || cropDrag) return;
    event.stopPropagation();
});
imageEditModal.addEventListener('click', event => {
    event.stopPropagation();
    if(event.target === imageEditModal) closeImageEditor();
});
imageEditModal.addEventListener('wheel', event => {
    event.stopPropagation();
}, {passive:false});
document.getElementById('previewStage').addEventListener('mousedown', event => {
    if(imageEditMode !== 'preview' || event.button !== 0) return;
    if(event.target.closest('.preview-tools-overlay, .preview-download-overlay')) return;
    if(event.target.closest('.preview-compare-handle')) return;
    if(event.target.closest('video')) return;
    event.preventDefault();
    event.stopPropagation();
    if(panoramaState.enabled){
        panoramaState.drag = {
            clientX:event.clientX,
            clientY:event.clientY,
            yaw:panoramaState.yaw,
            pitch:panoramaState.pitch
        };
        document.getElementById('previewStage')?.classList.add('panning');
        return;
    }
    previewPanDrag = {clientX:event.clientX, clientY:event.clientY, startX:previewPan.x, startY:previewPan.y};
});
document.getElementById('imageEditStage').addEventListener('mousedown', event => {
    if(imageEditMode === 'preview' || event.button !== 0) return;
    if(event.target.closest('.image-edit-actions, .preview-tools-overlay, .preview-download-overlay, .crop-box, .crop-handle')) return;
    if(event.target.closest('#editDrawCanvas, #editTextCanvas, .edit-text-inline') && imageEditMode !== 'crop') return;
    const stage = event.currentTarget;
    if(stage.scrollWidth <= stage.clientWidth && stage.scrollHeight <= stage.clientHeight) return;
    event.preventDefault();
    event.stopPropagation();
    imageEditPanDrag = {
        clientX:event.clientX,
        clientY:event.clientY,
        scrollLeft:stage.scrollLeft,
        scrollTop:stage.scrollTop
    };
});
document.getElementById('previewCompareHandle').addEventListener('mousedown', event => {
    if(imageEditMode !== 'preview' || !previewCompareOn || previewCompareIndex < 0) return;
    event.preventDefault();
    event.stopPropagation();
    previewPanDrag = null;
    previewCompareDrag = true;
    setPreviewComparePos(event.clientX);
});
document.getElementById('previewCompareHandle').addEventListener('pointerdown', event => {
    if(imageEditMode !== 'preview' || !previewCompareOn || previewCompareIndex < 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    previewPanDrag = null;
    previewCompareDrag = true;
    setPreviewComparePos(event.clientX);
});
document.getElementById('previewCompareHandle').addEventListener('pointermove', event => {
    if(!previewCompareDrag) return;
    event.preventDefault();
    event.stopPropagation();
    setPreviewComparePos(event.clientX);
});
document.getElementById('previewCompareHandle').addEventListener('pointerup', event => {
    if(previewCompareDrag){
        event.preventDefault();
        event.stopPropagation();
    }
    previewCompareDrag = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
});
document.getElementById('previewCompareHandle').addEventListener('pointercancel', event => {
    previewCompareDrag = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
});
document.getElementById('editDrawCanvas').addEventListener('pointerdown', beginEditDraw);
document.getElementById('editDrawCanvas').addEventListener('pointermove', moveEditDraw);
document.getElementById('editDrawCanvas').addEventListener('pointerup', endEditDraw);
document.getElementById('editDrawCanvas').addEventListener('pointercancel', endEditDraw);
document.getElementById('editDrawCanvas').addEventListener('pointerleave', endEditDraw);
document.getElementById('gridJoinCanvas')?.addEventListener('pointerdown', beginGridJoinDrag);
document.getElementById('gridJoinCanvas')?.addEventListener('pointermove', moveGridJoinDrag);
document.getElementById('gridJoinCanvas')?.addEventListener('pointerup', endGridJoinDrag);
document.getElementById('gridJoinCanvas')?.addEventListener('pointercancel', endGridJoinDrag);
document.getElementById('gridJoinCanvas')?.addEventListener('pointerleave', endGridJoinDrag);
document.getElementById('editTextCanvas')?.addEventListener('pointerdown', beginEditText);
document.getElementById('editTextCanvas')?.addEventListener('pointermove', moveEditText);
document.getElementById('editTextCanvas')?.addEventListener('pointerup', endEditText);
document.getElementById('editTextCanvas')?.addEventListener('pointercancel', endEditText);
document.getElementById('editTextCanvas')?.addEventListener('pointerleave', endEditText);
document.getElementById('editTextCanvas')?.addEventListener('dblclick', event => {
    if(imageEditMode !== 'brush' || brushTool !== 'text') return;
    event.preventDefault(); event.stopPropagation();
    const hit = hitEditTextItem(editTextPoint(event));
    if(hit){
        setSelectedEditTextItem(hit.id);
        beginEditTextInline(hit);
    }
});
['paintBrushSize','paintBrushColor'].forEach(id => {
    const control = document.getElementById(id);
    if(!control) return;
    control.addEventListener('input', syncSelectedEditTextStyleFromBrush);
    control.addEventListener('change', () => { editTextDirty = false; });
});
['gridHorizontalLines','gridVerticalLines','gridGapSize'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        syncGridGapValue();
        refreshGridSplitPreview();
    });
});
document.querySelectorAll('[data-panorama-ratio]').forEach(btn => {
    btn.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        applyPanoramaRatio(btn.dataset.panoramaRatio || 'wide');
    });
});
['panoramaRatioW','panoramaRatioH'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
        panoramaState.ratio = 'custom';
        panoramaState.customW = Math.max(1, Math.min(999, Number(document.getElementById('panoramaRatioW')?.value || 16)));
        panoramaState.customH = Math.max(1, Math.min(999, Number(document.getElementById('panoramaRatioH')?.value || 9)));
        refreshPanoramaControls();
        resizePanoramaViewer();
    });
});
document.getElementById('imageEditStage').addEventListener('wheel', event => {
    if(!cropState) return;
    event.preventDefault();
    event.stopPropagation();
    if(imageEditMode === 'preview'){
        if(seekPreviewVideoFrames(event.deltaY > 0 ? 1 : -1)) return;
        if(panoramaState.enabled){
            const factor = event.deltaY < 0 ? 0.92 : 1 / 0.92;
            panoramaState.fov = Math.max(35, Math.min(100, panoramaState.fov * factor));
            updateZoomLabel();
            return;
        }
        const oldZoom = previewZoom;
        const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
        previewZoom = Math.max(0.05, previewZoom * factor);
        const frame = document.getElementById('previewFrame');
        const rect = frame?.getBoundingClientRect();
        if(rect){
            const originX = event.clientX - rect.left - rect.width / 2;
            const originY = event.clientY - rect.top - rect.height / 2;
            const ratio = previewZoom / oldZoom;
            previewPan.x -= originX * (ratio - 1);
            previewPan.y -= originY * (ratio - 1);
        }
        applyPreviewTransform();
        return;
    }
    if(imageEditMode === 'grid' && gridOperationMode === 'join'){
        const stage = event.currentTarget;
        const oldZoom = imageEditZoom;
        const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
        imageEditZoom = Math.max(0.15, Math.min(6.0, imageEditZoom * factor));
        const stageRect = stage.getBoundingClientRect();
        const mx = event.clientX - stageRect.left;
        const my = event.clientY - stageRect.top;
        const contentX = stage.scrollLeft + mx;
        const contentY = stage.scrollTop + my;
        const scale = imageEditZoom / oldZoom;
        refreshGridSplitPreview();
        syncImageEditOverflow();
        updateZoomLabel();
        stage.scrollLeft = contentX * scale - mx;
        stage.scrollTop = contentY * scale - my;
        return;
    }
    const stage = event.currentTarget;
    const oldZoom = imageEditZoom;
    const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
    imageEditZoom = Math.max(0.15, Math.min(6.0, imageEditZoom * factor));
    const stageRect = stage.getBoundingClientRect();
    const mx = event.clientX - stageRect.left;
    const my = event.clientY - stageRect.top;
    const contentX = stage.scrollLeft + mx;
    const scale = imageEditZoom / oldZoom;
    const contentY = stage.scrollTop + my;
    applyImageEditZoom(scale);
    stage.scrollLeft = contentX * scale - mx;
    stage.scrollTop = contentY * scale - my;
}, {passive:false});
window.addEventListener('resize', () => {
    if(cropState) syncImageEditOverflow();
    if(panoramaState.enabled) resizePanoramaViewer();
});
window.addEventListener('studio-theme-change', event => applyTheme(event.detail?.theme || 'light'));
try {
    const apiChannel = new BroadcastChannel('studio-api');
    apiChannel.onmessage = async event => {
        if(event.data?.type === 'providers-changed'){
            await refreshSmartConfigFromSettings();
        }
        if(event.data?.type === 'asset_library_updated') handleAssetLibraryUpdatedMessage(event.data);
        if(event.data?.type === 'canvas_updated') handleCanvasUpdatedMessage(event.data);
    };
} catch(e) {}
window.addEventListener('focus', () => {
    if(Date.now() - lastConfigRefreshAt > 1200) refreshSmartConfigFromSettings();
});
window.addEventListener('message', event => {
    if(event.origin && event.origin !== location.origin) return;
    if(event.data?.type === 'studio-theme') applyTheme(event.data.theme || 'light');
    if(event.data?.type === 'providers-changed') refreshSmartConfigFromSettings();
    if(event.data?.type === 'asset_library_updated') handleAssetLibraryUpdatedMessage(event.data);
    if(event.data?.type === 'canvas_updated') handleCanvasUpdatedMessage(event.data);
    if(event.data?.type === 'studio-lang' && window.StudioI18n) {
        window.StudioI18n.set(event.data.lang || 'zh');
    }
});
window.addEventListener('studio-lang-change', () => {
    renderDynamicParams();
    renderInputThumbsRow(selectedNode());
    renderAssetLibrary();
    if(document.getElementById('imageEditModal')?.classList.contains('open')){
        setImageEditMode(imageEditMode);
    }
    if(promptTemplatePanel?.classList?.contains('open')) renderPromptTemplatePanel();
    render();
});
window.onload = async () => {
    applyTheme(localStorage.getItem('studio_theme') || localStorage.getItem('canvas_theme') || 'light');
    loadPromptPresets();
    loadPromptTemplateGroups();
    loadPromptTemplateOverrides();
    await loadPromptTemplates();
    if(window.StudioI18n) window.StudioI18n.apply();
    if(window.lucide) lucide.createIcons();
    connectAssetLibrarySyncSocket();
    await loadConfig();
    await loadAssetLibrary();
    await loadCanvas();
    syncApiKindToggleVisibility();
    render();
};
