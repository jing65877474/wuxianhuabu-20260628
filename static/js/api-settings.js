let providers = [];
let selectedId = '';
const providerList = document.getElementById('providerList');
const editorTitle = document.getElementById('editorTitle');
const statusEl = document.getElementById('status');
const nameInput = document.getElementById('nameInput');
const idInput = document.getElementById('idInput');
const baseInput = document.getElementById('baseInput');
const protocolInput = document.getElementById('protocolInput');
const imageRequestModeInput = document.getElementById('imageRequestModeInput');
const keyInput = document.getElementById('keyInput');
const keyHint = document.getElementById('keyHint');
const volcArkKeyHint = document.getElementById('volcArkKeyHint');
const volcAkInput = document.getElementById('volcAkInput');
const volcSkInput = document.getElementById('volcSkInput');
const volcAssetKeyHint = document.getElementById('volcAssetKeyHint');
const volcProjectInput = document.getElementById('volcProjectInput');
const volcRegionInput = document.getElementById('volcRegionInput');
const jimengCliPanel = document.getElementById('jimengCliPanel');
const jimengCliStatus = document.getElementById('jimengCliStatus');
const jimengCredit = document.getElementById('jimengCredit');
const jimengLoginBox = document.getElementById('jimengLoginBox');
const jimengHelpOverlay = document.getElementById('jimengHelpOverlay');
const jimengHelpCommand = document.getElementById('jimengHelpCommand');
const jimengHelpOutput = document.getElementById('jimengHelpOutput');
const settingsContent = document.getElementById('settingsContent');
const recommendContent = document.getElementById('recommendContent');
const recommendPanel = document.getElementById('recommendPanel');
const providerOnboardingCard = document.getElementById('providerOnboardingCard');
const imageModelList = document.getElementById('imageModelList');
const chatModelList = document.getElementById('chatModelList');
const videoModelList = document.getElementById('videoModelList');
const msLoraBlock = document.getElementById('msLoraBlock');
const msLoraList = document.getElementById('msLoraList');
const recommendApiOverlay = document.getElementById('recommendApiOverlay');
const recommendApiList = document.getElementById('recommendApiList');
const VOLCENGINE_DEFAULT_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';
const VOLCENGINE_DEFAULT_PROJECT_NAME = 'default';
const VOLCENGINE_DEFAULT_REGION = 'cn-beijing';
const MS_BUILTIN_IMAGE_MODELS = [
    'Tongyi-MAI/Z-Image-Turbo',
    'Qwen/Qwen-Image-2512',
    'Qwen/Qwen-Image-Edit-2511',
    'black-forest-labs/FLUX.2-klein-9B'
];
const MS_DEFAULT_BASE_URL = 'https://api-inference.modelscope.cn/v1';
const EXAMPLE_BASE_URL = 'https://api.example.com/v1';
const JIMENG_DEFAULT_IMAGE_MODELS = ['5.0', '4.6', '4.5', '4.1', '4.0', '3.1', '3.0'];
const JIMENG_DEFAULT_VIDEO_MODELS = ['seedance2.0fast_vip', 'seedance2.0_vip'];
const JIMENG_LEGACY_IMAGE_MODELS = new Set(['jimeng-image-2k', 'jimeng-image-4k']);
const JIMENG_LEGACY_VIDEO_MODELS = new Set(['jimeng-video-720p', 'jimeng-video-1080p']);
const ONBOARDING_GUIDES = {
    modelscope:{
        titleKey:'api.msOnboardingTitle',
        descKey:'api.msOnboardingDesc',
        primaryLabelKey:'api.msGetTokenCn',
        secondaryLabelKey:'api.msGetTokenGlobal',
        primaryUrl:'https://www.modelscope.cn/my/access/token',
        secondaryUrl:'https://www.modelscope.ai/my/access/token'
    }
};
let recommendInlineOpen = false;
let providerDragId = '';
const BUILTIN_PROVIDER_IDS = new Set(['comfly', 'modelscope', 'volcengine']);
// 仅用于读取和迁移旧版画布数据：过滤已移除的 ComfyUI / RunningHub 供应商。
const DEPRECATED_GENERATION_PROVIDER_IDS = new Set(['comfy', 'comfyui', 'runninghub', 'rh']);
const RECOMMENDED_APIS = [
    {
        name:'APIMART',
        base_url:'https://api.apimart.ai',
        protocol:'apimart',
        register_url:'https://apimart.ai/zh/register?aff=1uyAbb',
        tagKeys:['api.tagImageModels','api.tagVideoModels','api.tagLlmModels'],
        icons:['IMG','VID','LLM'],
        summaryKey:'api.recommendApimartSummary',
        advantages:['模型类型覆盖广', '适合多节点混合工作流', '异步协议适合长任务']
    },
    {
        name:'玉玉API',
        base_url:'https://yuli.host',
        protocol:'openai',
        register_url:'https://yuli.host/register?aff=95JQ',
        tagKeys:['api.tagImageModels','api.tagVideoModels','api.tagLlmModels'],
        icons:['IMG','VID','LLM'],
        summaryKey:'api.recommendYuliSummary',
        perkKey:'api.recommendYuliPerk',
        advantages:['模型种类最全', '图像/视频/LLM 全覆盖', '支持签到送积分'],
        // 添加平台时预填的默认模型列表（含逐模型协议覆盖）
        image_models:['gpt-image-2', 'gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview'],
        chat_models:['gpt-5.5'],
        video_models:['veo3.1-fast'],
        model_protocols:{'gemini-3.1-flash-image-preview':'gemini', 'gemini-3-pro-image-preview':'gemini'}
    },
    {
        name:'Agnes AI',
        base_url:'https://apihub.agnes-ai.com',
        protocol:'openai',
        image_request_mode:'openai-json',
        register_url:'https://platform.agnes-ai.com/settings/apiKeys',
        tagKeys:['api.tagImageModels','api.tagVideoModels','api.tagLlmModels'],
        icons:['IMG','VID','LLM'],
        summaryKey:'api.recommendAgnesSummary',
        perkKey:'api.recommendAgnesFree',
        perkClass:'recommend-free-tag',
        advantages:['免费额度可用', '支持 Agnes 图像与视频接口', 'OpenAI 兼容地址配置简单'],
        image_models:['agnes-image-2.1-flash', 'agnes-image-2.0-flash'],
        chat_models:[],
        video_models:['agnes-video-v2.0']
    },
    {
        name:'FHL',
        base_url:'https://www.fhl.mom',
        protocol:'openai',
        register_url:'https://www.fhl.mom/register?aff=86L574B4T2N9',
        tagKeys:['Codex','api.tagGptImage2'],
        icons:['CODEX','GPT','IMG'],
        summaryKey:'api.recommendFhlSummary',
        advantages:['OpenAI 兼容接入', '配置路径简单', '适合图像与代码相关模型']
    }
];

function refreshIcons(){ if(window.lucide) lucide.createIcons(); }
function tr(key){ return window.StudioI18n ? window.StudioI18n.t(key) : key; }
function trf(key, vars={}){
    let text = tr(key);
    Object.entries(vars).forEach(([name, value]) => {
        text = text.replaceAll(`{${name}}`, String(value ?? ''));
    });
    return text;
}
function setStatus(text){ statusEl.textContent = text || ''; }
function broadcastStudioApiChange(type='providers-changed'){
    const message = { type, updated_at:Date.now() };
    try { new BroadcastChannel('studio-api').postMessage(message); } catch(e) {}
    try { window.parent?.postMessage(message, '*'); } catch(e) {}
    try { window.top?.postMessage(message, '*'); } catch(e) {}
}
function normalizeId(value){
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-').slice(0, 40);
}
// 平台 Key 按 ID 写入 API/.env；ID 一旦创建就保持稳定，避免改名或中文名称导致 Key 看起来丢失。
function deriveIdFromName(name, existingId){
    if(existingId) return existingId;
    let id = normalizeId(name);
    if(!id){
        id = 'api-' + Math.random().toString(36).slice(2, 8);
    }
    let candidate = id, i = 2;
    while(providers.some(p => p.id === candidate)){
        candidate = `${id}-${i++}`;
    }
    return candidate;
}
function updateIdPreview(){
    const item = provider();
    if(!item) return;
    const isBuiltin = item.id === 'comfly' || item.id === 'modelscope' || item.id === 'volcengine' || item.id === 'jimeng';
    const idPreview = document.getElementById('idPreview');
    if(!idPreview) return;
    if(isBuiltin){
        idPreview.textContent = item.id;
        return;
    }
    idPreview.textContent = deriveIdFromName(nameInput.value, item.id);
}
function provider(){
    return visibleProviders().find(item => item.id === selectedId) || visibleProviders()[0] || providers[0];
}
function isDeprecatedProviderId(id){
    return DEPRECATED_GENERATION_PROVIDER_IDS.has(String(id || '').trim().toLowerCase());
}
function isProviderTemporarilyHidden(item){
    return Boolean(item && (BUILTIN_PROVIDER_IDS.has(item.id) || isDeprecatedProviderId(item.id) || isDeprecatedProviderId(item.protocol)));
}
function visibleProviders(){
    return (providers || []).filter(item => !isProviderTemporarilyHidden(item));
}
function isFixedProvider(itemOrId){
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId?.id;
    // 即梦 CLI 不再是固定平台：可删除、可排序，未添加则不存在。
    return BUILTIN_PROVIDER_IDS.has(id);
}
function unique(values){
    const seen = new Set();
    return values.map(v => String(v || '').trim()).filter(v => v && !seen.has(v) && seen.add(v));
}
function volcengineArkKeyHintText(item){
    return item?.has_key ? `方舟 API Key 已保存：${item.key_env || 'API/.env'} ${item.key_preview || ''}` : '还没有保存方舟 API Key。';
}
function volcengineAssetKeyHintText(item){
    const ak = item?.has_volcengine_access_key ? `AK 已保存：${item.volcengine_access_key_env || 'API/.env'} ${item.volcengine_access_key_preview || ''}` : 'AK 未保存';
    const sk = item?.has_volcengine_secret_key ? `SK 已保存：${item.volcengine_secret_key_env || 'API/.env'} ${item.volcengine_secret_key_preview || ''}` : 'SK 未保存';
    return `${ak} · ${sk}`;
}
function isNewUserProvider(item){
    if(!item) return false;
    if(item.id === 'modelscope') return !item.has_key;
    return false;
}
function renderProviderOnboarding(item){
    if(!providerOnboardingCard) return;
    const guide = ONBOARDING_GUIDES[item?.id];
    const visible = Boolean(!recommendInlineOpen && guide && isNewUserProvider(item));
    providerOnboardingCard.hidden = !visible;
    document.body.classList.toggle('show-provider-onboarding', visible);
    if(!visible){
        providerOnboardingCard.innerHTML = '';
        return;
    }
    if(item.id === 'modelscope'){
        providerOnboardingCard.innerHTML = `
            <div class="onboarding-head">
                <div>
                    <div class="onboarding-title">${escapeHtml(tr(guide.titleKey))}</div>
                    <div class="onboarding-desc">${escapeHtml(tr(guide.descKey))}</div>
                </div>
                <span class="onboarding-badge">${escapeHtml(tr('api.onboardingNew'))}</span>
            </div>
            <div class="onboarding-step-panel onboarding-rh-linear-panel onboarding-ms-linear-panel">
                <div class="onboarding-rh-panel-head">
                    <div>
                        <div class="onboarding-step-title">${escapeHtml(tr('api.msOnboardingStep'))}</div>
                    </div>
                    <i data-lucide="key-round" class="onboarding-rh-icon w-4 h-4"></i>
                </div>
                <div class="onboarding-rh-linear-rows">
                    <div class="onboarding-rh-linear-row onboarding-ms-linear-row">
                        <div class="onboarding-rh-source-group">
                            <div class="onboarding-rh-source-label">${escapeHtml(tr('api.msTokenLabel'))}</div>
                            <div class="onboarding-key-actions onboarding-rh-key-actions">
                                <a class="onboarding-key-btn" href="${escapeAttr(guide.primaryUrl)}" target="_blank" rel="noopener noreferrer"><i data-lucide="key-round" class="w-3.5 h-3.5"></i><span>${escapeHtml(tr(guide.primaryLabelKey))}</span></a>
                                <a class="onboarding-key-btn" href="${escapeAttr(guide.secondaryUrl)}" target="_blank" rel="noopener noreferrer"><i data-lucide="globe-2" class="w-3.5 h-3.5"></i><span>${escapeHtml(tr(guide.secondaryLabelKey))}</span></a>
                            </div>
                        </div>
                        <div class="recommend-flow-arrow onboarding-flow-arrow onboarding-rh-row-arrow" aria-hidden="true"><span></span><b></b></div>
                        <label class="onboarding-key-field onboarding-rh-row-field">
                            <span>API Key</span>
                            <input type="password" value="${escapeAttr(keyInput?.value || '')}" placeholder="${escapeAttr(tr('api.msTokenPlaceholder'))}" oninput="syncOnboardingKeyInput('standard', this.value)">
                        </label>
                    </div>
                </div>
                <div class="onboarding-rh-save-line">
                    <button class="onboarding-save-btn onboarding-rh-save-all" type="button" onclick="saveKeyOnly()"><i data-lucide="check" class="w-3.5 h-3.5"></i><span>${escapeHtml(tr('api.save'))}</span></button>
                </div>
            </div>
        `;
        refreshIcons();
        return;
    }
}
function syncOnboardingKeyInput(kind, value){
    if(keyInput) keyInput.value = value || '';
}
function applyProviderOnboardingDefaults(id){
    const item = providers.find(provider => provider.id === id);
    if(!item) return;
    if(id === 'modelscope'){
        item.base_url = MS_DEFAULT_BASE_URL;
        item.protocol = 'openai';
        item.image_models = unique([...MS_BUILTIN_IMAGE_MODELS, ...(item.image_models || [])]);
        item.chat_models = unique([...(item.chat_models || [])]);
        item.ms_defaults_version = Math.max(3, Number(item.ms_defaults_version || 0));
    } else if(id === 'volcengine'){
        item.base_url = VOLCENGINE_DEFAULT_BASE_URL;
        item.protocol = 'volcengine';
        item.video_models = unique(item.video_models || []);
        item.volcengine_project_name = item.volcengine_project_name || VOLCENGINE_DEFAULT_PROJECT_NAME;
        item.volcengine_region = item.volcengine_region || VOLCENGINE_DEFAULT_REGION;
    } else if(id === 'jimeng'){
        item.base_url = '';
        item.protocol = 'jimeng';
        item.image_models = unique([...(item.image_models || []).filter(model => !JIMENG_LEGACY_IMAGE_MODELS.has(String(model || '').trim())), ...JIMENG_DEFAULT_IMAGE_MODELS]);
        item.video_models = unique([...(item.video_models || []).filter(model => !JIMENG_LEGACY_VIDEO_MODELS.has(String(model || '').trim())), ...JIMENG_DEFAULT_VIDEO_MODELS]);
    }
    selectedId = item.id;
    renderEditor();
    setStatus('已显示默认配置，填写 Key 后点击保存生效');
}
function refreshProviderOnboarding(){
    renderProviderOnboarding(provider());
    refreshIcons();
}
function syncEditor(){
    const item = provider();
    if(!item) return;
    const oldId = item.id;
    const isBuiltin = item.id === 'comfly' || item.id === 'modelscope' || item.id === 'volcengine' || item.id === 'jimeng';
    // 内置和自定义平台的 ID 都保持稳定；新建时若没有 ID 才生成一次。
    const nextId = isBuiltin ? item.id : deriveIdFromName(nameInput.value, item.id);
    item.id = nextId;
    if(oldId !== item.id) selectedId = item.id;
    item.name = nameInput.value.trim() || item.id;
    const selectedProtocol = item.id === 'modelscope' ? 'openai' : item.id === 'volcengine' ? 'volcengine' : item.id === 'jimeng' ? 'jimeng' : (protocolInput?.value || 'openai');
    item.base_url = selectedProtocol === 'jimeng' ? '' : baseInput.value.trim();
    // 固定平台不从协议下拉读取
    item.protocol = selectedProtocol;
    item.image_request_mode = normalizeImageRequestMode(
        item.id === 'modelscope' || item.id === 'volcengine' || item.id === 'jimeng'
            ? 'openai'
            : (imageRequestModeInput?.value || item.image_request_mode)
    );
    item.image_generation_endpoint = '';
    item.image_edit_endpoint = '';
    const key = keyInput.value.trim();
    if(key) item.api_key = key;
    if(item.id === 'volcengine'){
        const ak = volcAkInput?.value.trim() || '';
        const sk = volcSkInput?.value.trim() || '';
        if(ak) item.volcengine_access_key_id = ak;
        if(sk) item.volcengine_secret_access_key = sk;
        item.volcengine_project_name = (volcProjectInput?.value.trim() || VOLCENGINE_DEFAULT_PROJECT_NAME);
        item.volcengine_region = (volcRegionInput?.value.trim() || VOLCENGINE_DEFAULT_REGION);
    }
}
function updateProtocolFromInput(){
    const item = provider();
    if(!item || !protocolInput || item.id === 'modelscope' || item.id === 'volcengine' || item.id === 'jimeng') return;
    const value = String(protocolInput.value || 'openai').toLowerCase();
    item.protocol = ['openai', 'apimart', 'gemini', 'volcengine', 'jimeng'].includes(value) ? value : 'openai';
    if(item.protocol === 'jimeng') item.base_url = '';
    document.body.classList.toggle('show-jimeng', item.protocol === 'jimeng');
    clearVerifyResult();
    // 协议会改变整个表单（如即梦 CLI 账户面板、默认模型、Key 占位）。renderEditor 是唯一切换这些的入口，
    // 这里复跑一次让面板立即出现；保存并恢复 Key 输入框，避免推荐流程里先填的 Key 被 renderEditor 清空。
    const savedKey = keyInput ? keyInput.value : '';
    renderEditor();
    if(keyInput) keyInput.value = savedKey;
}
function isVolcengineProvider(item){
    return String(item?.protocol || '').toLowerCase() === 'volcengine';
}
function openRecommendApi(){
    recommendInlineOpen = false;
    syncRecommendView();
    renderRecommendApi();
    renderProviderOnboarding(provider());
}
function closeRecommendApi(){
    if(recommendApiOverlay) recommendApiOverlay.style.display = 'none';
    recommendInlineOpen = false;
    syncRecommendView();
    renderRecommendApi();
    renderEditor();
}
function syncRecommendView(){
    if(settingsContent) settingsContent.hidden = recommendInlineOpen;
    if(recommendContent) recommendContent.hidden = !recommendInlineOpen;
    const recommendTitle = recommendContent?.querySelector('.editor-title');
    const recommendSub = recommendContent?.querySelector('.editor-sub');
    if(recommendTitle) recommendTitle.textContent = tr('api.recommendPanelTitle');
    if(recommendSub) recommendSub.textContent = tr('api.recommendPanelSub');
    document.body.classList.toggle('show-recommend-mode', recommendInlineOpen);
}
function renderRecommendApi(){
    if(!recommendPanel) return;
    if(!recommendInlineOpen){
        recommendPanel.innerHTML = '';
        return;
    }
    const html = RECOMMENDED_APIS.map((api, index) => `
        <section class="recommend-card recommend-platform-card" style="--recommend-index:${index}">
            <div class="recommend-platform-info">
                <div class="recommend-platform-head">
                    <div>
                        <div class="recommend-name"><span>${escapeHtml(api.name)}</span></div>
                    </div>
                    <span class="recommend-badge">${escapeHtml(api.protocol === 'apimart' ? 'APIMart' : 'OpenAI')}</span>
                </div>
                <p class="recommend-platform-summary">${escapeHtml(tr(api.summaryKey))}</p>
                <div class="recommend-tags">
                    ${api.perkKey ? `<span class="recommend-tag recommend-perk-tag ${escapeAttr(api.perkClass || '')}"><i data-lucide="gift" class="w-3 h-3"></i><span>${escapeHtml(tr(api.perkKey))}</span></span>` : ''}
                    ${(api.tagKeys || []).map(tag => `<span class="recommend-tag">${escapeHtml(tag.startsWith('api.') ? tr(tag) : tag)}</span>`).join('')}
                </div>
            </div>
            <div class="recommend-platform-setup">
                <div class="recommend-setup-title">${escapeHtml(tr('api.recommendQuickSetup'))}</div>
                <div class="recommend-quick-stack recommend-setup-flow">
                    <div class="recommend-guide-source onboarding-rh-source-group">
                        <div class="onboarding-rh-source-label">${escapeHtml(tr('api.getKey'))}</div>
                        <div class="onboarding-key-actions onboarding-rh-key-actions recommend-single-action">
                            <a class="onboarding-key-btn recommend-guide-key-btn" href="${escapeAttr(api.register_url)}" target="_blank" rel="noopener noreferrer"><i data-lucide="key-round" class="w-3.5 h-3.5"></i><span>${escapeHtml(tr('api.getKey'))}</span></a>
                        </div>
                    </div>
                    <div class="recommend-flow-arrow onboarding-flow-arrow recommend-guide-arrow" aria-hidden="true"><span></span><b></b></div>
                    <div class="recommend-guide-save">
                        <label class="onboarding-key-field onboarding-rh-row-field">
                            <span>API Key</span>
                            <input type="password" data-recommend-key="${index}" placeholder="${escapeAttr(trf('api.recommendKeyPlaceholder', {name:api.name}))}">
                        </label>
                        <button class="onboarding-save-btn recommend-guide-save-btn" type="button" onclick="saveRecommendedApi(${index})"><span>${escapeHtml(tr('api.save'))}</span></button>
                    </div>
                </div>
            </div>
        </section>
    `).join('');
    recommendPanel.innerHTML = `
        <div class="onboarding-head">
            <div>
                <div class="onboarding-title">${escapeHtml(tr('api.recommendPanelTitle'))}</div>
                <div class="onboarding-desc">${escapeHtml(tr('api.recommendPanelDesc'))}</div>
            </div>
        </div>
        <div class="recommend-api-body recommend-inline-body">${html}</div>
        <div class="recommend-note">${escapeHtml(tr('api.recommendApiNote'))}</div>
        <div class="recommend-account-invite">
            <div>
                <div class="recommend-account-title">${escapeHtml(tr('api.recommendAccountTitle'))}</div>
                <div class="recommend-account-desc">${escapeHtml(tr('api.recommendAccountDesc'))}</div>
            </div>
            <a class="onboarding-key-btn recommend-account-link" href="https://bewild.ai?code=WULIDX" target="_blank" rel="noopener noreferrer"><i data-lucide="external-link" class="w-3.5 h-3.5"></i><span>${escapeHtml(tr('api.viewPlans'))}</span></a>
        </div>
    `;
    refreshIcons();
}
function recommendedProviderForApi(api){
    let item = providers.find(provider => String(provider.name || '').toLowerCase() === api.name.toLowerCase());
    if(item) return item;
    const baseId = normalizeId(api.name) || 'custom-api';
    let id = baseId;
    let suffix = 2;
    while(providers.some(provider => provider.id === id)) id = `${baseId}-${suffix++}`;
    item = {
        id,
        name:api.name,
        base_url:api.base_url,
        protocol:api.protocol,
        image_request_mode:normalizeImageRequestMode(api.image_request_mode),
        image_generation_endpoint:'',
        image_edit_endpoint:'',
        enabled:true,
        primary:false,
        image_models:Array.isArray(api.image_models) ? [...api.image_models] : [],
        chat_models:Array.isArray(api.chat_models) ? [...api.chat_models] : [],
        video_models:Array.isArray(api.video_models) ? [...api.video_models] : [],
        model_protocols:(api.model_protocols && typeof api.model_protocols === 'object') ? {...api.model_protocols} : {},
        has_key:false,
        key_preview:''
    };
    providers.push(item);
    return item;
}
async function saveRecommendedApi(index){
    const api = RECOMMENDED_APIS[index];
    if(!api) return;
    const input = recommendPanel?.querySelector(`[data-recommend-key="${index}"]`);
    const key = input?.value.trim() || '';
    if(!key){ alert(tr('api.enterApiKey')); return; }
    const item = recommendedProviderForApi(api);
    selectedId = item.id;
    recommendInlineOpen = false;
    syncRecommendView();
    renderProviderList();
    renderEditor();
    keyInput.value = key;
    if(protocolInput){
        protocolInput.value = api.protocol;
        protocolInput.dispatchEvent(new Event('change'));
    }
    if(imageRequestModeInput){
        imageRequestModeInput.value = normalizeImageRequestMode(api.image_request_mode);
        imageRequestModeInput.dispatchEvent(new Event('change'));
    }
    syncEditor();
    const ok = await saveProviders();
    if(ok) setStatus(trf('api.recommendSaved', {name:api.name}));
}
function sortedProviders(){
    const order = ['modelscope', 'volcengine'];
    return visibleProviders().sort((a, b) => {
        const ai = order.indexOf(a.id);
        const bi = order.indexOf(b.id);
        if(ai === -1 && bi === -1) return 0;
        if(ai === -1) return 1;
        if(bi === -1) return -1;
        return ai - bi;
    });
}
function providerDragAttrs(item){
    if(isFixedProvider(item)) return '';
    const id = escapeAttr(item.id);
    return ` draggable="true" data-provider-id="${id}" ondragstart="handleProviderDragStart(event,'${id}')" ondragover="handleProviderDragOver(event,'${id}')" ondrop="handleProviderDrop(event,'${id}')" ondragend="handleProviderDragEnd()"`;
}
function renderProviderList(){
    providerList.innerHTML = sortedProviders().map(item => {
        const active = item.id === selectedId ? 'active' : '';
        const stateClass = item.enabled === false ? 'is-disabled' : (item.has_key ? 'has-key' : 'missing-key');
        const protocolLabel = String(item.protocol || 'openai').toUpperCase();
        if(item.id === 'modelscope'){
            return `
                <button class="provider-card provider-card-banner ${active} ${stateClass}" type="button" onclick="selectProvider('${escapeHtml(item.id)}')">
                    <span class="provider-banner-inner">
                        <span class="provider-logo-wrap">
                            <img src="/static/images/modelscope.gif" alt="ModelScope" class="ms-icon-light">
                            <img src="/static/images/modelscope-1.gif" alt="ModelScope" class="ms-icon-dark">
                            <span class="provider-logo-fallback">ModelScope</span>
                        </span>
                        <span class="provider-protocol-pill">OpenAI</span>
                    </span>
                </button>
            `;
        }
        if(item.id === 'volcengine'){
            return `
                <button class="provider-card provider-card-banner ${active} ${stateClass}" type="button" onclick="selectProvider('${escapeHtml(item.id)}')">
                    <span class="provider-banner-inner">
                        <span class="provider-logo-wrap">
                            <img src="/static/images/volcengine-theme-light.svg" alt="火山引擎" class="volcengine-icon ms-icon-light">
                            <img src="/static/images/volcengine-theme-dark.svg" alt="火山引擎" class="volcengine-icon ms-icon-dark">
                            <span class="provider-logo-fallback">火山引擎</span>
                        </span>
                        <span class="provider-protocol-pill">Ark</span>
                    </span>
                </button>
            `;
        }
        return `
            <button class="provider-card provider-card-sortable ${active} ${stateClass}" type="button" onclick="selectProvider('${escapeHtml(item.id)}')"${providerDragAttrs(item)}>
                <span class="provider-drag-handle" aria-hidden="true"><i data-lucide="grip-vertical" class="w-3.5 h-3.5"></i></span>
                <span class="provider-mark"><i data-lucide="${item.has_key ? 'key-round' : 'key'}" class="w-4 h-4"></i></span>
                <span class="provider-info">
                    <div class="provider-name">${escapeHtml(item.name || item.id)}</div>
                    <div class="provider-meta">${escapeHtml(item.base_url || '未配置地址')}</div>
                </span>
                <span class="provider-side-meta">
                    <span class="provider-status-dot"></span>
                    <span class="provider-protocol-pill">${escapeHtml(protocolLabel)}</span>
                </span>
            </button>
        `;
    }).join('');
    refreshIcons();
}
function handleProviderDragStart(event, id){
    const item = providers.find(provider => provider.id === id);
    if(!item || isFixedProvider(item)){
        event.preventDefault();
        return;
    }
    providerDragId = id;
    event.currentTarget.classList.add('is-dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
}
function handleProviderDragOver(event, id){
    if(!providerDragId || providerDragId === id || isFixedProvider(id)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    providerList?.querySelectorAll('.provider-card-drop-target').forEach(el => el.classList.remove('provider-card-drop-target'));
    event.currentTarget.classList.add('provider-card-drop-target');
}
function handleProviderDrop(event, targetId){
    event.preventDefault();
    providerList?.querySelectorAll('.provider-card-drop-target').forEach(el => el.classList.remove('provider-card-drop-target'));
    const sourceId = providerDragId || event.dataTransfer.getData('text/plain');
    providerDragId = '';
    if(!sourceId || sourceId === targetId || isFixedProvider(sourceId) || isFixedProvider(targetId)) return;
    const sourceIndex = providers.findIndex(item => item.id === sourceId);
    const targetIndex = providers.findIndex(item => item.id === targetId);
    if(sourceIndex < 0 || targetIndex < 0) return;
    const [moved] = providers.splice(sourceIndex, 1);
    const adjustedTargetIndex = providers.findIndex(item => item.id === targetId);
    providers.splice(adjustedTargetIndex, 0, moved);
    renderProviderList();
    saveProviders();
}
function handleProviderDragEnd(){
    providerDragId = '';
    providerList?.querySelectorAll('.is-dragging,.provider-card-drop-target').forEach(el => {
        el.classList.remove('is-dragging', 'provider-card-drop-target');
    });
}
function renderEditor(){
    const item = provider();
    if(!item) return;
    editorTitle.textContent = item.name || item.id;
    nameInput.value = item.name || '';
    idInput.value = item.id || '';
    updateIdPreview();
    clearVerifyResult();
    baseInput.placeholder = EXAMPLE_BASE_URL;
    baseInput.value = item.base_url || '';
    if(protocolInput) protocolInput.value = item.id === 'volcengine' ? 'volcengine' : item.id === 'jimeng' ? 'jimeng' : (item.protocol || 'openai');
    if(imageRequestModeInput) imageRequestModeInput.value = normalizeImageRequestMode(item.image_request_mode);
    keyInput.value = '';
    keyInput.placeholder = item.has_key ? `${tr('api.keepCurrentKey')} ${item.key_preview || ''}` : tr('api.enterKey');
    keyHint.textContent = item.has_key ? `${tr('api.keySaved')}${item.key_env || 'API/.env'}` : tr('api.noKey');
    const isModelScope = item.id === 'modelscope';
    const isVolcengine = item.id === 'volcengine' || String(protocolInput?.value || item.protocol || '').toLowerCase() === 'volcengine';
    const isStandaloneVolcengine = item.id === 'volcengine';
    const isJimeng = item.id === 'jimeng' || String(protocolInput?.value || item.protocol || '').toLowerCase() === 'jimeng';
    if(isVolcengine){
        item.base_url = item.base_url || VOLCENGINE_DEFAULT_BASE_URL;
        item.protocol = 'volcengine';
        item.volcengine_project_name = item.volcengine_project_name || VOLCENGINE_DEFAULT_PROJECT_NAME;
        item.volcengine_region = item.volcengine_region || VOLCENGINE_DEFAULT_REGION;
        keyInput.placeholder = item.has_key ? `保持当前方舟 API Key ${item.key_preview || ''}` : '输入方舟 API Key';
        keyHint.textContent = volcengineArkKeyHintText(item);
        if(volcArkKeyHint) volcArkKeyHint.textContent = volcengineArkKeyHintText(item);
        if(volcAkInput){
            volcAkInput.value = '';
            volcAkInput.placeholder = item.has_volcengine_access_key ? `保持当前 AK ${item.volcengine_access_key_preview || ''}` : 'Access Key ID';
        }
        if(volcSkInput){
            volcSkInput.value = '';
            volcSkInput.placeholder = item.has_volcengine_secret_key ? `保持当前 SK ${item.volcengine_secret_key_preview || ''}` : 'Secret Access Key';
        }
        if(volcAssetKeyHint) volcAssetKeyHint.textContent = volcengineAssetKeyHintText(item);
        if(volcProjectInput) volcProjectInput.value = item.volcengine_project_name || VOLCENGINE_DEFAULT_PROJECT_NAME;
        if(volcRegionInput) volcRegionInput.value = item.volcengine_region || VOLCENGINE_DEFAULT_REGION;
    }
    if(isJimeng){
        item.base_url = '';
        item.protocol = 'jimeng';
        item.image_models = unique([...(item.image_models || []).filter(model => !JIMENG_LEGACY_IMAGE_MODELS.has(String(model || '').trim())), ...JIMENG_DEFAULT_IMAGE_MODELS]);
        item.video_models = unique([...(item.video_models || []).filter(model => !JIMENG_LEGACY_VIDEO_MODELS.has(String(model || '').trim())), ...JIMENG_DEFAULT_VIDEO_MODELS]);
        keyInput.placeholder = '即梦 CLI 使用本机 dreamina login，无需 API Key';
        keyHint.textContent = '请先在终端安装 dreamina CLI，并执行 dreamina login';
    }
    document.body.classList.toggle('show-ms', isModelScope);
    document.body.classList.toggle('show-volcengine', isVolcengine);
    document.body.classList.toggle('show-volcengine-standalone', isStandaloneVolcengine);
    document.body.classList.toggle('show-jimeng', isJimeng);
    renderProviderOnboarding(item);
    renderRecommendApi();
    if(msLoraBlock) msLoraBlock.style.display = isModelScope ? 'flex' : 'none';
    if(jimengCliPanel){
        jimengCliPanel.hidden = !isJimeng;
        jimengCliPanel.style.display = isJimeng ? 'flex' : 'none';
        if(isJimeng) refreshJimengStatus(false);
    }
    const deleteBtn = document.getElementById('deleteBtn');
    if(deleteBtn) deleteBtn.style.display = isFixedProvider(item) ? 'none' : 'inline-flex';
    renderModels('image');
    renderModels('chat');
    renderModels('video');
    if(isModelScope) renderMsLoras();
    else if(msLoraList) msLoraList.innerHTML = '';
    renderProviderList();
}
function showVerifyResult(html){ const el = document.getElementById('verifyResult'); if(el){ el.style.display = 'block'; el.innerHTML = html; } }
function clearVerifyResult(){ const el = document.getElementById('verifyResult'); if(el){ el.style.display = 'none'; el.innerHTML = ''; } }
function prettyJson(value){
    try { return JSON.stringify(value, null, 2); } catch(_) { return String(value || ''); }
}
function jimengCreditText(raw){
    if(!raw) return '';
    const parts = [];
    const seen = new Set();
    const visit = value => {
        if(!value || typeof value !== 'object') return;
        Object.entries(value).forEach(([key, item]) => {
            const low = key.toLowerCase();
            if(/credit|balance|quota|point|coin|积分|余额/.test(low) && item !== null && typeof item !== 'object'){
                const label = `${key}: ${item}`;
                if(!seen.has(label)){ seen.add(label); parts.push(label); }
            }
            if(item && typeof item === 'object') visit(item);
        });
    };
    visit(raw);
    return parts.join(' · ') || prettyJson(raw);
}
function setJimengStatus(text, ok=null){
    if(!jimengCliStatus) return;
    jimengCliStatus.textContent = text || '未检测';
    jimengCliStatus.classList.toggle('ok', ok === true);
    jimengCliStatus.classList.toggle('bad', ok === false);
}
function renderJimengLoginBox(data){
    if(!jimengLoginBox) return;
    const text = data?.text || '';
    const qrUrl = data?.qr_url || '';
    const qrHtml = qrUrl && qrUrl.startsWith('http')
        ? `<img class="jimeng-qr-img" src="${escapeHtml(qrUrl)}" alt="即梦登录二维码">`
        : '';
    jimengLoginBox.hidden = false;
    jimengLoginBox.innerHTML = `${qrHtml}<pre>${escapeHtml(text || '等待 CLI 输出登录二维码...')}</pre>`;
}
let jimengLoginTimer = null;
async function refreshJimengStatus(showCredit=true){
    if(!jimengCliPanel || jimengCliPanel.hidden) return;
    setJimengStatus('检测中...');
    try {
        const data = await fetch('/api/jimeng/status').then(r => r.json());
        setJimengStatus(data.logged_in ? '已登录' : (data.installed ? '未登录' : '未安装'), data.logged_in === true);
        if(data.installed && data.version_ok === false && jimengCredit){
            jimengCredit.textContent = `⚠ 检测到 dreamina CLI 版本 ${data.cli_version || '未知'}，低于推荐的 ${data.min_version || '1.4.2'}。旧版本任务状态可能无法更新，请升级 CLI。`;
        } else if(showCredit && data.raw && jimengCredit){
            jimengCredit.textContent = jimengCreditText(data.raw);
        }
    } catch(e){
        setJimengStatus('检测失败', false);
        if(jimengCredit) jimengCredit.textContent = e.message || String(e);
    }
}
async function startJimengLogin(){
    setJimengStatus('等待扫码...');
    if(jimengCredit) jimengCredit.textContent = '';
    try {
        const data = await fetch('/api/jimeng/login/start', {method:'POST'}).then(async r => {
            const json = await r.json();
            if(!r.ok) throw new Error(json.detail || '启动登录失败');
            return json;
        });
        renderJimengLoginBox(data);
        clearInterval(jimengLoginTimer);
        jimengLoginTimer = setInterval(pollJimengLogin, 2500);
        refreshIcons();
    } catch(e){
        setJimengStatus('登录失败', false);
        if(jimengLoginBox){
            jimengLoginBox.hidden = false;
            jimengLoginBox.innerHTML = `<pre>${escapeHtml(e.message || String(e))}</pre>`;
        }
    }
}
async function pollJimengLogin(){
    try {
        const data = await fetch('/api/jimeng/login/status').then(r => r.json());
        renderJimengLoginBox(data);
        if(data.logged_in){
            clearInterval(jimengLoginTimer);
            setJimengStatus('已登录', true);
            if(jimengCredit) jimengCredit.textContent = jimengCreditText(data.raw);
        } else if(data.running){
            setJimengStatus('等待扫码...');
        } else {
            setJimengStatus('未登录', false);
        }
    } catch(e){
        clearInterval(jimengLoginTimer);
        setJimengStatus('登录检测失败', false);
    }
}
async function refreshJimengCredit(){
    setJimengStatus('查询余额...');
    try {
        const data = await fetch('/api/jimeng/credit').then(async r => {
            const json = await r.json();
            if(!r.ok) throw new Error(json.detail || '查询余额失败');
            return json;
        });
        setJimengStatus('已登录', true);
        if(jimengCredit) jimengCredit.textContent = jimengCreditText(data.raw);
    } catch(e){
        setJimengStatus('未登录', false);
        if(jimengCredit) jimengCredit.textContent = e.message || String(e);
    }
}
async function logoutJimeng(){
    if(!confirm('确认退出即梦 CLI 登录？')) return;
    try {
        const data = await fetch('/api/jimeng/logout', {method:'POST'}).then(async r => {
            const json = await r.json();
            if(!r.ok) throw new Error(json.detail || '退出登录失败');
            return json;
        });
        setJimengStatus('已退出', false);
        if(jimengCredit) jimengCredit.textContent = prettyJson(data.raw);
        if(jimengLoginBox) jimengLoginBox.hidden = true;
    } catch(e){
        setJimengStatus('退出失败', false);
        if(jimengCredit) jimengCredit.textContent = e.message || String(e);
    }
}
function openJimengHelp(){
    if(!jimengHelpOverlay) return;
    jimengHelpOverlay.style.display = 'flex';
    loadJimengHelp();
}
function closeJimengHelp(){
    if(jimengHelpOverlay) jimengHelpOverlay.style.display = 'none';
}
async function loadJimengHelp(){
    if(!jimengHelpOutput) return;
    jimengHelpOutput.textContent = '加载中...';
    try {
        const command = jimengHelpCommand?.value || '';
        const data = await fetch('/api/jimeng/help', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({command})
        }).then(async r => {
            const json = await r.json();
            if(!r.ok) throw new Error(json.detail || '加载帮助失败');
            return json;
        });
        jimengHelpOutput.textContent = data.text || prettyJson(data.raw);
    } catch(e){
        jimengHelpOutput.textContent = e.message || String(e);
    }
}
function currentProviderApiKey(item){
    return keyInput.value.trim();
}
function normalizeImageRequestMode(value){
    return String(value || '').trim().toLowerCase() === 'openai-json' ? 'openai-json' : 'openai';
}
function imageRequestModeLabel(mode){
    return normalizeImageRequestMode(mode) === 'openai-json' ? 'OpenAI JSON' : 'OpenAI 标准';
}
function applyDetectedImageRequestMode(mode){
    const item = provider();
    if(!item || !imageRequestModeInput) return false;
    const detected = normalizeImageRequestMode(mode);
    const changed = normalizeImageRequestMode(item.image_request_mode) !== detected || normalizeImageRequestMode(imageRequestModeInput.value) !== detected;
    imageRequestModeInput.value = detected;
    item.image_request_mode = detected;
    return changed;
}
function applyDetectedProtocol(protocol){
    const item = provider();
    const detected = String(protocol || '').toLowerCase();
    if(!item || !protocolInput || !['openai', 'apimart', 'gemini', 'volcengine', 'jimeng'].includes(detected)) return false;
    if(String(protocolInput.value || '').toLowerCase() === detected && String(item.protocol || '').toLowerCase() === detected) return false;
    protocolInput.value = detected;
    item.protocol = detected;
    item.base_url = detected === 'jimeng' ? '' : (baseInput?.value.trim() || item.base_url || '');
    if(detected === 'volcengine'){
        item.video_models = unique(item.video_models || []);
        item.volcengine_project_name = item.volcengine_project_name || VOLCENGINE_DEFAULT_PROJECT_NAME;
        item.volcengine_region = item.volcengine_region || VOLCENGINE_DEFAULT_REGION;
    }
    protocolInput.dispatchEvent(new Event('change'));
    return true;
}

async function probeAsync(){
    const item = provider();
    if(!item) return;
    const btn = document.getElementById('probeAsyncBtn');
    const baseUrl = baseInput.value.trim();
    if(!baseUrl){ alert('请先填写请求地址'); return; }
    if(btn){ btn.disabled = true; btn.querySelector('span').textContent = '检测中...'; }
    showVerifyResult(`<span style="color:var(--muted);font-size:11px;font-weight:700">正在检测协议类型...</span>`);
    try {
        const apiKey = currentProviderApiKey(item);
        const currentProtocol = String(protocolInput?.value || item.protocol || 'openai').toLowerCase();
        const data = await fetch('/api/providers/probe-async', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                base_url: baseUrl,
                api_key: apiKey,
                provider_id: item.id,
                protocol: currentProtocol,
                image_request_mode: imageRequestModeInput?.value || item.image_request_mode || 'openai'
            })
        }).then(async r => {
            if(!r.ok) throw new Error((await r.json()).detail || '请求失败');
            return r.json();
        });
        const detectedProtocol = String(data.protocol || '').toLowerCase();
        const isAsync = data.ok === true && detectedProtocol === 'apimart';
        const isOpenAiCompat = data.ok === true && detectedProtocol === 'openai';
        const keepManualProtocol = ['gemini', 'volcengine', 'jimeng'].includes(currentProtocol);
        if(protocolInput && !keepManualProtocol){
            applyDetectedProtocol(detectedProtocol || (isAsync ? 'apimart' : 'openai'));
        }
        if(data.image_request_mode) applyDetectedImageRequestMode(data.image_request_mode);
        const rawJson = JSON.stringify(data.raw, null, 2);
        const probeMessage = String(data.message || '');
        const hideTasksEndpointTip = probeMessage.includes('/v1/tasks/');
        const color = (isAsync || isOpenAiCompat || data.ok === true) ? '#15803d' : data.ok === null ? '#b45309' : '#64748b';
        const icon = (isAsync || isOpenAiCompat || data.ok === true) ? '✓' : '⚠';
        const proto = detectedProtocol === 'volcengine'
            ? '方舟/Ark 任务协议'
            : isAsync
                ? 'APIMart 异步'
                : detectedProtocol === 'openai'
                    ? 'OpenAI 兼容'
                    : keepManualProtocol
                    ? (currentProtocol === 'gemini' ? 'Gemini' : currentProtocol.toUpperCase())
                    : 'OpenAI 兼容';
        showVerifyResult(`
            ${hideTasksEndpointTip ? '' : `<div style="font-size:11px;font-weight:800;color:${color}">${icon} ${escapeHtml(probeMessage)}</div>`}
            <div style="font-size:11px;color:var(--muted);font-weight:700;margin-top:2px">${keepManualProtocol ? '协议已验证为' : '协议已自动设置为'}：<strong style="color:var(--text)">${proto}</strong> · 图片接口：<strong style="color:var(--text)">${imageRequestModeLabel(imageRequestModeInput?.value || item.image_request_mode)}</strong></div>
            <details style="margin-top:6px">
                <summary style="font-size:10.5px;color:var(--muted);cursor:pointer;font-weight:700;user-select:none">▸ 查看原始响应 (HTTP ${data.status_code})</summary>
                <pre style="margin-top:6px;padding:10px 12px;border-radius:10px;background:var(--soft);border:1px solid var(--line-2);font-size:10.5px;font-family:ui-monospace,Menlo,monospace;white-space:pre-wrap;word-break:break-all;color:var(--text);max-height:200px;overflow:auto">${escapeHtml(rawJson)}</pre>
            </details>`);
    } catch(e){
        const keepManualProtocol = ['gemini', 'volcengine', 'jimeng'].includes(String(protocolInput?.value || item.protocol || '').toLowerCase());
        if(protocolInput && !keepManualProtocol){ protocolInput.value = 'openai'; protocolInput.dispatchEvent(new Event('change')); }
        const suffix = keepManualProtocol ? '，已保留当前手动选择的协议' : '，协议已设为 OpenAI 兼容';
        showVerifyResult(`<div style="font-size:11px;font-weight:800;color:#b45309">⚠ ${escapeHtml(e.message || String(e))}${suffix}</div>`);
    } finally {
        if(btn){ btn.disabled = false; btn.querySelector('span').textContent = '验证协议'; refreshIcons(); }
    }
}

async function testConnection(){
    const item = provider();
    if(!item) return;
    const btn = document.getElementById('testUrlBtn');
    const baseUrl = baseInput.value.trim();
    const isJimeng = item.id === 'jimeng' || (protocolInput?.value || '') === 'jimeng';
    if(!baseUrl && !isJimeng){ alert('请先填写请求地址'); return; }
    if(btn){ btn.disabled = true; btn.querySelector('span').textContent = tr('api.testingUrl') || '验证中...'; }
    showVerifyResult(`<span style="color:var(--muted);font-size:11px;font-weight:700">验证中...</span>`);
    try {
        const apiKey = currentProviderApiKey(item);
        const data = await fetch('/api/providers/test-connection', {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                base_url: baseUrl,
                api_key: apiKey,
                provider_id: item.id,
                protocol: protocolInput?.value || 'openai',
                image_request_mode: imageRequestModeInput?.value || item.image_request_mode || 'openai'
            })
        }).then(async r => {
            if(!r.ok) throw new Error((await r.json()).detail || (tr('api.urlInvalid') || '验证失败'));
            return r.json();
        });
        if(data.ok){
            const detectedProtocol = String(data.protocol || '').toLowerCase();
            if(detectedProtocol && detectedProtocol !== String(protocolInput?.value || '').toLowerCase()){
                applyDetectedProtocol(detectedProtocol);
            }
            if(data.image_request_mode) applyDetectedImageRequestMode(data.image_request_mode);
            // 存入 picker 状态并启用「选择模型」按钮，但不自动弹出
            lastFetchedAll = data.all || [];
            lastFetchedSuggestion = {
                image: new Set(data.image_models || []),
                chat: new Set(data.chat_models || []),
                video: new Set(data.video_models || []),
            };
            const openBtn = document.getElementById('openPickerBtn');
            if(openBtn){ openBtn.disabled = false; openBtn.style.opacity = '1'; }
            const isVolcengineNow = (detectedProtocol === 'volcengine' || isVolcengineProvider(item));
            const volcengineNote = isVolcengineNow
                ? `<div style="margin-top:6px;color:#92400e;font-size:11px;font-weight:700">${detectedProtocol === 'volcengine' ? '已自动识别为方舟/Ark 任务协议。' : ''}火山协议提示：模型列表只代表可见模型，聊天模型建议填写你在方舟控制台创建的 <code>ep-...</code> 推理接入点。</div>`
                : '';
            const jimengNote = isJimeng ? `<div style="margin-top:6px;color:#15803d;font-size:11px;font-weight:700">即梦 CLI 已可用，可在画布里选择“即梦 CLI”生成。</div>` : '';
            const imageModeNote = ` · 图片接口：${imageRequestModeLabel(imageRequestModeInput?.value || item.image_request_mode)}`;
            showVerifyResult(`<span style="color:#15803d;font-size:11px;font-weight:800">✓ 地址验证通过 · 找到 ${data.model_count} 个模型${imageModeNote}</span>${volcengineNote}${jimengNote}`);
        } else {
            showVerifyResult(`
                <div style="font-size:11px;font-weight:800;color:#b45309">⚠ 地址验证未通过 (HTTP ${data.status})</div>
                <div style="font-size:11px;color:var(--muted);font-weight:600;margin-top:3px">${escapeHtml((data.message || '').slice(0,200))}</div>`);
        }
    } catch(e){
        showVerifyResult(`<div style="font-size:11px;font-weight:800;color:#b45309">⚠ ${escapeHtml(e.message || String(e))}</div>`);
    } finally {
        if(btn){ btn.disabled = false; btn.querySelector('span').textContent = tr('api.testUrl') || '验证地址'; }
    }
}
let lastFetchedAll = [];          // 全部模型 id 列表
let lastFetchedSuggestion = null; // 后端自动分类建议

async function fetchModels(){
    const item = provider();
    if(!item) return;
    syncEditor();
    const btn = document.getElementById('fetchModelsBtn');
    const baseUrl = baseInput.value.trim();
    const apiKey = currentProviderApiKey(item);
    const isJimeng = item.id === 'jimeng' || (protocolInput?.value || '') === 'jimeng';
    if(!baseUrl && !isJimeng){ alert('请先填写请求地址'); return; }
    if(btn){ btn.disabled = true; btn.querySelector('span').textContent = tr('api.fetchingModels') || '拉取中...'; }
    setStatus(tr('api.fetchingModels') || '正在从上游拉取模型列表...');
    try {
        const data = await fetch('/api/providers/fetch-models', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                base_url:baseUrl,
                api_key:apiKey,
                provider_id: item.id,
                protocol: protocolInput?.value || 'openai',
                image_request_mode:imageRequestModeInput?.value || item.image_request_mode || 'openai'
            })
        }).then(async r => {
            if(!r.ok) throw new Error((await r.json()).detail || (tr('api.urlInvalid') || '拉取失败'));
            return r.json();
        });
        lastFetchedAll = data.all || [];
        lastFetchedSuggestion = {
            image: new Set(data.image_models || []),
            chat: new Set(data.chat_models || []),
            video: new Set(data.video_models || []),
        };
        const detectedProtocol = String(data.protocol || '').toLowerCase();
        if(detectedProtocol && detectedProtocol !== String(protocolInput?.value || '').toLowerCase()){
            applyDetectedProtocol(detectedProtocol);
        }
        if(data.image_request_mode) applyDetectedImageRequestMode(data.image_request_mode);
        // 启用「选择模型」按钮，并 statusbar 显示已拉取数量
        const openBtn = document.getElementById('openPickerBtn');
        if(openBtn){ openBtn.disabled = false; openBtn.style.opacity = '1'; }
        const extra = (detectedProtocol === 'volcengine' || isVolcengineProvider(item)) ? ' · 已识别方舟协议，火山聊天建议改填 ep-... 接入点' : '';
        const imageModeExtra = normalizeImageRequestMode(imageRequestModeInput?.value || item.image_request_mode) === 'openai-json' ? ' · 图片接口已设为 OpenAI JSON' : '';
        setStatus(`已拉取 ${data.total} 个模型 · 点「选择模型」勾选要导入的${extra}${imageModeExtra}`);
        openModelPicker();
    } catch(e){
        alert('拉取失败：' + (e.message || e));
        setStatus('拉取失败');
    } finally {
        if(btn){ btn.disabled = false; btn.querySelector('span').textContent = tr('api.fetchModels') || '拉取模型'; }
    }
}

// —— 模型选择器浮层 ——
// 每个模型只归一类（根据用户已配置 或 关键字猜测）；勾选 = 纳入该分类
let pickerState = { category: {}, selected: {} };
let pickerVisibleIds = [];
function openModelPicker(){
    const item = provider();
    if(!item || !lastFetchedAll.length){ alert('没有拉取到模型'); return; }
    const existing = { image: new Set(item.image_models||[]), chat: new Set(item.chat_models||[]), video: new Set(item.video_models||[]) };
    const allIds = new Set([...lastFetchedAll, ...(item.image_models||[]), ...(item.chat_models||[]), ...(item.video_models||[])]);
    pickerState = { category: {}, selected: {} };
    allIds.forEach(id => {
        // 类别归属：用户已配置 > 关键字建议 > 默认 chat
        let cat;
        if(existing.image.has(id)) cat = 'image';
        else if(existing.video.has(id)) cat = 'video';
        else if(existing.chat.has(id)) cat = 'chat';
        else if(lastFetchedSuggestion?.image?.has(id)) cat = 'image';
        else if(lastFetchedSuggestion?.video?.has(id)) cat = 'video';
        else cat = 'chat';
        pickerState.category[id] = cat;
        // 默认勾选状态：已在用户配置里的 = 勾选；新拉的 = 不勾选（让用户主动选）
        pickerState.selected[id] = existing.image.has(id) || existing.chat.has(id) || existing.video.has(id);
    });
    // 默认 tab 切回「全部」
    document.querySelectorAll('.picker-cat-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === 'all'));
    document.getElementById('modelPickerOverlay').style.display = 'flex';
    renderModelPicker();
}
function closeModelPicker(){ document.getElementById('modelPickerOverlay').style.display = 'none'; }
function renderModelPicker(){
    const filter = (document.getElementById('pickerFilter')?.value || '').toLowerCase();
    const currentTab = document.querySelector('.picker-cat-tab.active')?.dataset.cat || 'all';
    const ids = Object.keys(pickerState.category).sort();
    // 各分类总数 / 已选数
    const totals = { all: ids.length, image:0, chat:0, video:0 };
    const selecteds = { all:0, image:0, chat:0, video:0 };
    ids.forEach(id => {
        const cat = pickerState.category[id];
        totals[cat]++;
        if(pickerState.selected[id]){ selecteds[cat]++; selecteds.all++; }
    });
    // 过滤显示
    const list = ids.filter(id => {
        if(filter && !id.toLowerCase().includes(filter)) return false;
        if(currentTab === 'all') return true;
        return pickerState.category[id] === currentTab;
    });
    pickerVisibleIds = list;
    document.getElementById('pickerCount').textContent = `共 ${totals.all} 个模型 · 当前显示 ${list.length} 个`;
    document.querySelectorAll('.picker-cat-tab').forEach(tab => {
        const cat = tab.dataset.cat;
        tab.querySelector('.cat-count').textContent = `${selecteds[cat]}/${totals[cat]}`;
    });
    // 列表
    const html = list.map((id, index) => {
        const checked = pickerState.selected[id];
        return `
            <div class="picker-row ${checked?'has-sel':''}" onclick="togglePickerRowByIndex(${index})">
                <div class="picker-checkbox ${checked?'checked':''}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div class="picker-model-name" title="${escapeAttr(id)}">${escapeHtml(id)}</div>
            </div>
        `;
    }).join('');
    document.getElementById('pickerList').innerHTML = html || `<div style="padding:32px;text-align:center;color:var(--faint);font-size:12px">无匹配</div>`;
    // 底部汇总
    const sumImage = document.getElementById('sumImage');
    const sumChat = document.getElementById('sumChat');
    const sumVideo = document.getElementById('sumVideo');
    const sumUnsel = document.getElementById('sumUnsel');
    if(sumImage){ sumImage.textContent = `生图 ${selecteds.image}`; sumImage.classList.toggle('picker-sum-chip-empty', selecteds.image === 0); }
    if(sumChat){ sumChat.textContent = `LLM ${selecteds.chat}`; sumChat.classList.toggle('picker-sum-chip-empty', selecteds.chat === 0); }
    if(sumVideo){ sumVideo.textContent = `视频 ${selecteds.video}`; sumVideo.classList.toggle('picker-sum-chip-empty', selecteds.video === 0); }
    if(sumUnsel){ sumUnsel.textContent = `未选 ${totals.all - selecteds.all}`; }
}
function togglePickerRow(id){
    pickerState.selected[id] = !pickerState.selected[id];
    renderModelPicker();
}
function togglePickerRowByIndex(index){
    const id = pickerVisibleIds[index];
    if(typeof id !== 'string') return;
    togglePickerRow(id);
}
function selectPickerCat(cat){
    document.querySelectorAll('.picker-cat-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === cat));
    renderModelPicker();
}
function applyModelPicker(){
    const item = provider(); if(!item) return;
    const image = [], chat = [], video = [];
    Object.entries(pickerState.selected).forEach(([id, sel]) => {
        if(!sel) return;
        const cat = pickerState.category[id];
        if(cat === 'image') image.push(id);
        else if(cat === 'video') video.push(id);
        else chat.push(id);
    });
    item.image_models = image;
    item.chat_models = chat;
    item.video_models = video;
    renderModels('image'); renderModels('chat'); renderModels('video');
    renderMsLoras();
    setStatus(`已应用 · 生图 ${image.length} / LLM ${chat.length} / 视频 ${video.length}，点保存生效`);
    closeModelPicker();
}
async function saveKeyOnly(){
    const item = provider();
    if(!item) return;
    const key = keyInput.value.trim();
    if(!key){ alert(tr('api.enterKeyAlert') || '请输入 Key'); return; }
    item.api_key = key;
    const ok = await saveProviders();
    if(ok) keyInput.value = '';
}
async function clearKeyOnly(){
    const item = provider();
    if(!item) return;
    if(!item.has_key && !keyInput.value){ return; }
    if(!confirm(tr('api.confirmClearKey') || '确认清除当前 Key？')) return;
    item._clearKey = true;
    const ok = await saveProviders();
    if(ok) keyInput.value = '';
}
const FIXED_PROTOCOL_PROVIDER_IDS = new Set(['modelscope', 'volcengine', 'jimeng']);
function providerSupportsModelProtocol(item){
    return Boolean(item) && !FIXED_PROTOCOL_PROVIDER_IDS.has(item.id);
}
function modelProtocolSelectHtml(kind, index, model, item){
    if(kind === 'video' || !providerSupportsModelProtocol(item)) return '';
    const map = (item.model_protocols && typeof item.model_protocols === 'object') ? item.model_protocols : {};
    const current = String(map[String(model || '').trim()] || '').toLowerCase();
    const opt = (val, label) => `<option value="${val}" ${current === val ? 'selected' : ''}>${label}</option>`;
    return `<select class="model-protocol-select" title="该模型使用的协议，默认跟随平台全局协议" onchange="updateModelProtocol('${kind}', ${index}, this.value)">
        <option value="" ${current === '' ? 'selected' : ''}>默认</option>
        ${opt('openai', 'OpenAI')}
        ${opt('gemini', 'Gemini')}
    </select>`;
}
function renderModels(kind){
    const item = provider();
    const key = kind === 'image' ? 'image_models' : kind === 'video' ? 'video_models' : 'chat_models';
    const list = kind === 'image' ? imageModelList : kind === 'video' ? videoModelList : chatModelList;
    const models = item?.[key] || [];
    if(!models.length){
        list.innerHTML = `<div class="empty">${tr('api.noModels')}</div>`;
        return;
    }
    const showProtocol = kind !== 'video' && providerSupportsModelProtocol(item);
    list.innerHTML = models.map((model, index) => `
        <div class="model-row${showProtocol ? ' has-protocol' : ''}">
            <input value="${escapeAttr(model)}" oninput="updateModel('${kind}', ${index}, this.value)">
            ${modelProtocolSelectHtml(kind, index, model, item)}
            <button class="icon-btn" type="button" onclick="removeModel('${kind}', ${index})" title="删除"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>
    `).join('');
    refreshIcons();
}
function msLoraTargetOptions(selected){
    const item = provider();
    const models = unique([selected, ...MS_BUILTIN_IMAGE_MODELS, ...((item?.image_models) || [])]);
    return models.filter(Boolean).map(model => `<option value="${escapeAttr(model)}" ${model === selected ? 'selected' : ''}>${escapeHtml(model)}</option>`).join('');
}
function normalizeLoraStrength(value){
    const n = Number(value);
    if(!Number.isFinite(n)) return 0.8;
    return Math.max(0, Math.min(2, n));
}
function renderMsLoras(){
    const item = provider();
    if(!msLoraList || !item || item.id !== 'modelscope') return;
    item.ms_loras = Array.isArray(item.ms_loras) ? item.ms_loras : [];
    if(!item.ms_loras.length){
        msLoraList.innerHTML = `<div class="lora-empty">${tr('api.loraEmpty')}</div>`;
        return;
    }
    msLoraList.innerHTML = item.ms_loras.map((lora, index) => {
        const target = lora.target_model || lora.model || MS_BUILTIN_IMAGE_MODELS[0];
        const strength = normalizeLoraStrength(lora.strength ?? lora.default_strength ?? 0.8);
        return `
            <div class="lora-row">
                <label class="lora-field">
                    <span>${tr('api.loraId')}</span>
                    <input value="${escapeAttr(lora.id || '')}" placeholder="${escapeAttr(tr('api.loraIdPlaceholder'))}" oninput="updateMsLora(${index}, 'id', this.value)">
                </label>
                <label class="lora-field">
                    <span>${tr('api.loraTargetModel')}</span>
                    <select onchange="updateMsLora(${index}, 'target_model', this.value)">${msLoraTargetOptions(target)}</select>
                </label>
                <label class="lora-field">
                    <span>${tr('api.loraDefaultStrength')}</span>
                    <input type="number" min="0" max="2" step="0.05" value="${strength}" oninput="updateMsLora(${index}, 'strength', this.value)">
                </label>
                <button class="icon-btn" type="button" onclick="removeMsLora(${index})" title="${escapeAttr(tr('common.delete'))}"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
        `;
    }).join('');
    refreshIcons();
}
function addMsLora(){
    const item = provider();
    if(!item || item.id !== 'modelscope') return;
    item.ms_loras = Array.isArray(item.ms_loras) ? item.ms_loras : [];
    item.ms_loras.push({
        id:'',
        name:'',
        target_model: (item.image_models || [])[0] || MS_BUILTIN_IMAGE_MODELS[0],
        strength:0.8,
        enabled:true,
        note:''
    });
    renderMsLoras();
}
function updateMsLora(index, field, value){
    const item = provider();
    if(!item || item.id !== 'modelscope') return;
    item.ms_loras = Array.isArray(item.ms_loras) ? item.ms_loras : [];
    const lora = item.ms_loras[index];
    if(!lora) return;
    if(field === 'strength') lora.strength = normalizeLoraStrength(value);
    else lora[field] = value;
}
function removeMsLora(index){
    const item = provider();
    if(!item || item.id !== 'modelscope') return;
    item.ms_loras = Array.isArray(item.ms_loras) ? item.ms_loras : [];
    item.ms_loras.splice(index, 1);
    renderMsLoras();
}
function selectProvider(id){
    if(isProviderTemporarilyHidden(providers.find(item => item.id === id))) return;
    recommendInlineOpen = false;
    syncRecommendView();
    renderRecommendApi();
    syncEditor();
    selectedId = id;
    renderEditor();
}
function addProvider(){
    recommendInlineOpen = false;
    syncRecommendView();
    renderRecommendApi();
    syncEditor();
    let id = 'custom-api';
    let index = 2;
    while(providers.some(item => item.id === id)) id = `custom-api-${index++}`;
    providers.push({id, name:'API', base_url:'', protocol:'openai', image_request_mode:'openai', image_generation_endpoint:'', image_edit_endpoint:'', enabled:true, primary:false, image_models:[], chat_models:[], video_models:[], has_key:false, key_preview:''});
    selectedId = id;
    renderEditor();
}
function ensureCustomProvider(){
    if(visibleProviders().length) return;
    let id = 'custom-api';
    let index = 2;
    while(providers.some(item => item.id === id)) id = `custom-api-${index++}`;
    providers.push({id, name:'API', base_url:'', protocol:'openai', image_request_mode:'openai', image_generation_endpoint:'', image_edit_endpoint:'', enabled:true, primary:false, image_models:[], chat_models:[], video_models:[], has_key:false, key_preview:''});
}
function deleteProvider(){
    const item = provider();
    if(!item) return;
    if(isFixedProvider(item)){ alert(tr('api.defaultNoDelete') || '默认平台不能删除'); return; }
    if(providers.length <= 1){ alert(tr('api.keepOne')); return; }
    providers = providers.filter(p => p.id !== item.id);
    selectedId = providers[0]?.id || '';
    renderEditor();
    saveProviders();
}
async function saveVolcengineAssetKeys(){
    const item = provider();
    if(!item || item.id !== 'volcengine') return;
    const ak = volcAkInput?.value.trim() || '';
    const sk = volcSkInput?.value.trim() || '';
    if(!ak && !sk){ alert('请输入火山素材库 AK 或 SK'); return; }
    syncEditor();
    const ok = await saveProviders();
    if(ok){
        if(volcAkInput) volcAkInput.value = '';
        if(volcSkInput) volcSkInput.value = '';
    }
}
async function clearVolcengineAssetKeys(){
    const item = provider();
    if(!item || item.id !== 'volcengine') return;
    if(!confirm('确认清除火山素材库 AK/SK？')) return;
    item._clearVolcengineAccessKey = true;
    item._clearVolcengineSecretKey = true;
    const ok = await saveProviders();
    if(ok){
        if(volcAkInput) volcAkInput.value = '';
        if(volcSkInput) volcSkInput.value = '';
    }
}
function addModel(kind){
    const item = provider();
    const key = kind === 'image' ? 'image_models' : kind === 'video' ? 'video_models' : 'chat_models';
    item[key] = [...(item[key] || []), ''];
    renderModels(kind);
    if(kind === 'image') renderMsLoras();
}
function modelProtocolStillUsed(item, name){
    if(!item || !name) return false;
    const lists = ['image_models', 'chat_models', 'video_models'];
    return lists.some(k => Array.isArray(item[k]) && item[k].includes(name));
}
function updateModel(kind, index, value){
    const item = provider();
    const key = kind === 'image' ? 'image_models' : kind === 'video' ? 'video_models' : 'chat_models';
    const oldName = String(item[key][index] || '').trim();
    const newName = String(value || '').trim();
    item[key][index] = value;
    // 重命名时迁移该模型的协议覆盖
    if(item.model_protocols && typeof item.model_protocols === 'object' && oldName && oldName !== newName){
        if(Object.prototype.hasOwnProperty.call(item.model_protocols, oldName)){
            const proto = item.model_protocols[oldName];
            // 旧名称在其他列表里不再使用时才删除旧键
            const stillUsedElsewhere = (() => {
                const lists = ['image_models', 'chat_models', 'video_models'];
                return lists.some(k => Array.isArray(item[k]) && item[k].some((m, i) => !(k === key && i === index) && String(m || '').trim() === oldName));
            })();
            if(!stillUsedElsewhere) delete item.model_protocols[oldName];
            if(newName) item.model_protocols[newName] = proto;
        }
    }
    if(kind === 'image') renderMsLoras();
}
function updateModelProtocol(kind, index, value){
    const item = provider();
    const key = kind === 'image' ? 'image_models' : kind === 'video' ? 'video_models' : 'chat_models';
    const name = String(item[key]?.[index] || '').trim();
    if(!name) return;
    if(!item.model_protocols || typeof item.model_protocols !== 'object') item.model_protocols = {};
    const proto = String(value || '').trim().toLowerCase();
    if(proto === 'openai' || proto === 'gemini'){
        item.model_protocols[name] = proto;
    } else {
        delete item.model_protocols[name];
    }
}
function removeModel(kind, index){
    const item = provider();
    const key = kind === 'image' ? 'image_models' : kind === 'video' ? 'video_models' : 'chat_models';
    const removed = String(item[key][index] || '').trim();
    item[key].splice(index, 1);
    // 清理不再使用的协议覆盖
    if(removed && item.model_protocols && typeof item.model_protocols === 'object' && !modelProtocolStillUsed(item, removed)){
        delete item.model_protocols[removed];
    }
    renderModels(kind);
    if(kind === 'image') renderMsLoras();
}
async function loadProviders(){
    setStatus(tr('api.loading'));
    try {
        const data = await fetch('/api/providers').then(r => r.json());
        providers = data.providers || [];
        ensureCustomProvider();
        selectedId = sortedProviders()[0]?.id || '';
        renderEditor();
        setStatus('');
    } catch(err) {
        setStatus(tr('api.loadFailed'));
    }
}
async function saveProviders(){
    syncEditor();
    providers.forEach(item => {
        item.id = normalizeId(item.id);
        item.protocol = item.id === 'volcengine'
            ? 'volcengine'
            : item.id === 'jimeng'
            ? 'jimeng'
            : ['openai', 'apimart', 'gemini', 'volcengine', 'jimeng'].includes(String(item.protocol || '').toLowerCase()) ? String(item.protocol).toLowerCase() : 'openai';
        item.image_request_mode = normalizeImageRequestMode(
            item.id === 'modelscope' || item.id === 'volcengine' || item.id === 'jimeng'
                ? 'openai'
                : item.image_request_mode
        );
        if(item.id === 'jimeng') item.base_url = '';
        if(item.id === 'jimeng') item.video_models = unique([...(item.video_models || []).filter(model => !JIMENG_LEGACY_VIDEO_MODELS.has(String(model || '').trim())), ...JIMENG_DEFAULT_VIDEO_MODELS]);
        item.image_generation_endpoint = '';
        item.image_edit_endpoint = '';
        item.image_models = unique(item.image_models || []);
        item.chat_models = unique(item.chat_models || []);
        item.video_models = unique(item.video_models || []);
        item.ms_loras = (Array.isArray(item.ms_loras) ? item.ms_loras : []).map(lora => ({
            id:String(lora.id || '').trim(),
            name:String(lora.name || lora.id || '').trim(),
            target_model:String(lora.target_model || '').trim(),
            strength:normalizeLoraStrength(lora.strength ?? 0.8),
            enabled:lora.enabled !== false,
            note:String(lora.note || '').trim()
        })).filter(lora => lora.id && lora.target_model);
    });
    const providersToSave = visibleProviders();
    if(new Set(providersToSave.map(item => item.id)).size !== providersToSave.length){
        alert(tr('api.duplicateId'));
        return false;
    }
    setStatus(tr('api.saving'));
    try {
        const res = await fetch('/api/providers', {
            method:'PUT',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(providersToSave.map(item => ({
                id:item.id,
                name:item.name,
                base_url:item.base_url,
                protocol:(item.id === 'modelscope') ? 'openai' : item.id === 'volcengine' ? 'volcengine' : item.id === 'jimeng' ? 'jimeng' : (item.protocol || 'openai'),
                image_request_mode:item.image_request_mode || 'openai',
                image_generation_endpoint:item.image_generation_endpoint || '',
                image_edit_endpoint:item.image_edit_endpoint || '',
                enabled:item.enabled !== false,
                primary:false,
                image_models:item.image_models || [],
                chat_models:item.chat_models || [],
                video_models:item.video_models || [],
                model_protocols:(item.model_protocols && typeof item.model_protocols === 'object') ? item.model_protocols : {},
                ms_loras:item.id === 'modelscope' ? (item.ms_loras || []) : [],
                ms_defaults_version:item.id === 'modelscope' ? (item.ms_defaults_version || 1) : 0,
                volcengine_project_name:item.id === 'volcengine' ? (item.volcengine_project_name || VOLCENGINE_DEFAULT_PROJECT_NAME) : '',
                volcengine_region:item.id === 'volcengine' ? (item.volcengine_region || VOLCENGINE_DEFAULT_REGION) : '',
                volcengine_access_key_id:item.volcengine_access_key_id || undefined,
                volcengine_secret_access_key:item.volcengine_secret_access_key || undefined,
                api_key:item.api_key || undefined,
                clear_key:item._clearKey === true,
                clear_volcengine_access_key_id:item._clearVolcengineAccessKey === true,
                clear_volcengine_secret_access_key:item._clearVolcengineSecretKey === true
            })))
        });
        if(!res.ok) throw new Error((await res.json()).detail || tr('api.saveFailed'));
        const data = await res.json();
        providers = data.providers || providers;
        providers.forEach(item => {
            delete item.api_key;
            delete item.volcengine_access_key_id;
            delete item.volcengine_secret_access_key;
            delete item._clearKey;
            delete item._clearVolcengineAccessKey;
            delete item._clearVolcengineSecretKey;
        });
        selectedId = provider()?.id || providers[0]?.id || '';
        renderEditor();
        setStatus(tr('api.saved'));
        // 广播变更，画布等其他 iframe 立即重新拉取最新平台/模型列表
        broadcastStudioApiChange('providers-changed');
        return true;
    } catch(err) {
        setStatus(err.message || tr('api.saveFailed'));
        return false;
    }
}
function escapeHtml(str){
    return String(str || '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
function escapeAttr(str){ return escapeHtml(str).replace(/`/g, '&#96;'); }
window.addEventListener('message', event => {
    if(event.data?.type === 'studio-theme' && window.StudioTheme) window.StudioTheme.set(event.data.theme);
    if(event.data?.type === 'studio-lang' && window.StudioI18n) {
        window.StudioI18n.set(event.data.lang);
        if(recommendInlineOpen) renderRecommendApi();
        else renderEditor();
    }
});
recommendApiOverlay?.addEventListener('mousedown', event => {
    if(event.target === recommendApiOverlay) closeRecommendApi();
});
window.addEventListener('studio-lang-change', () => {
    syncRecommendView();
    if(recommendInlineOpen) renderRecommendApi();
    else renderEditor();
});
window.onload = () => {
    if(window.StudioTheme) window.StudioTheme.apply();
    if(window.StudioI18n) window.StudioI18n.apply();
    syncRecommendView();
    loadProviders();
    // 平台名输入时实时预览生成的 ID
    if(nameInput) nameInput.addEventListener('input', updateIdPreview);
    if(protocolInput) protocolInput.addEventListener('change', updateProtocolFromInput);
    if(imageRequestModeInput) imageRequestModeInput.addEventListener('change', () => {
        const item = provider();
        if(!item) return;
        item.image_request_mode = normalizeImageRequestMode(imageRequestModeInput.value);
    });
    [keyInput].forEach(input => {
        if(input) input.addEventListener('input', refreshProviderOnboarding);
    });
};
