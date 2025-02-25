<template>
  <div class="analysis-container">
    <div class="analysis-main">
      <div class="analysis-main-header">
        <span class="play_title" @dblclick="showSupportEvent">{{ urlTitle ? urlTitle : '暂无播放内容' }}</span>
        <history-icon size="1.3rem" @click="visible = true" />
        <t-drawer v-model:visible="visible" header="历史" size="small" class="history-items">
          <div v-for="item in historyList" :key="item.id" class="" @click="historyPlayEvent(item)">
            <div class="history-item">
              <div class="date">{{ item.date }}</div>
              <t-popup :content="item.videoName" destroy-on-close>
                <div class="title">{{ item.videoName }}</div>
              </t-popup>
              <div class="clear" @click.stop="histroyDeleteEvent(item)"><clear-icon size="1rem" /></div>
            </div>
            <t-divider dashed style="margin: 5px 0" />
          </div>
          <template #footer>
            <t-button @click="histroyClearEvent">清空</t-button>
            <t-button variant="outline" @click="visible = false"> 取消 </t-button>
          </template>
          <infinite-loading style="text-align: center" :distance="200" @infinite="load">
            <template #complete>人家是有底线的</template>
            <template #error>哎呀，出了点差错</template>
          </infinite-loading>
        </t-drawer>
      </div>
      <div class="analysis-main-play">
        <iframe
          ref="iframeRef"
          :key="key"
          class="analysis-play-box"
          :class="isSupport ? 'analysis-play-box-hidden' : 'analysis-play-box-show'"
          :src="iframeUrl"
          allowtransparency="true"
          frameborder="0"
          scrolling="no"
          allowfullscreen="true"
        ></iframe>
        <div class="analysis-setting">
          <div class="analysis-setting-group">
            <t-input-adornment>
              <template #prepend>
                <t-select v-model="selectAnalysisApi" placeholder="请选择接口" size="large" style="width: 10em">
                  <t-option v-for="item in analysisApi" :key="item.id" :label="item.name" :value="item.id" />
                </t-select>
              </template>
              <input v-model="analysisUrl" class="analysis-url" placeholder="请在此处粘贴视频网址" />
              <template #append>
                <span class="analysis-play" @click="analysisEvent">
                  <p class="analysis-tip">解析</p>
                </span>
              </template>
            </t-input-adornment>
          </div>
        </div>
      </div>
      <div v-if="isSupport" class="analysis-main-bottom">
        <div class="support-title">
          <span class="support-separator"></span>
          <p class="support-tip">
            <t-link theme="default" hover="color" @click="openCurrentUrl">
              <template #suffixIcon>
                <jump-icon />
              </template>

              支持平台
            </t-link>
          </p>
          <!-- <p class="support-tip">支持平台</p> -->
        </div>
        <div class="support-platform">
          <div v-for="(item, index) in VIDEOSITES" :key="index" class="logo-item">
            <div @click="openPlatform(item)">
              <img class="img-responsive" :src="item.img" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <dialog-platform-analysis-view
      v-model:visible="formDialogVisiblePlatformAnalysis"
      :data="platformAnalysisData"
      @platform-play="platformPlay"
    />
  </div>
</template>
<script setup lang="ts">
// TODO：JXU1NzI4JXU2NzJDJXU0RTFBJXU2NDFDJXU3RDIyc2hvd1N1cHBvcnRFdmVudCV1RkYwQyV1NjdFNSV1NzcwQiV1NjcyQyV1NjVCOSV1NkNENSV1NzY4NCV1ODlFNiV1NTNEMSV1N0M3QiV1NTc4Qg==
import { ref, reactive, onMounted } from 'vue';
import { useEventBus } from '@vueuse/core';
import { MessagePlugin } from 'tdesign-vue-next';
import { HistoryIcon, ClearIcon, JumpIcon } from 'tdesign-icons-vue-next';
import _ from 'lodash';
import moment from 'moment';
import InfiniteLoading from 'v3-infinite-loading';
import { setting, analyze, analyzeHistory } from '@/lib/dexie';
import zy from '@/lib/site/tools';
import DialogPlatformAnalysisView from './analysis/PlatformAnalysis.vue';

import 'v3-infinite-loading/lib/style.css';

import PLATFORM_CONFIG from '@/config/platform';

const formDialogVisiblePlatformAnalysis = ref(false);
const platformAnalysisData = ref();
const isSupport = ref(false);
const urlTitle = ref(''); // 播放地址的标题
const analysisApi = ref([]); // 解析接口api列表
const selectAnalysisApi = ref(null); // 选择的解析接口
const analysisUrl = ref(null); // 输入需要解析地址
const iframeUrl = ref(null); // 解析接口+需解析的地址
const iframeRef = ref(null); // iframe dom节点
const key = new Date().getTime(); // 解决iframe不刷新问题
const VIDEOSITES = reactive({
  ...PLATFORM_CONFIG.site,
}); // 视频网站列表
const visible = ref(false);
const historyList = ref([]);
const pagination = ref({
  pageIndex: 0,
  pageSize: 32,
  count: 0,
});
onMounted(async () => {
  await getAnalysisApi();
  await getHistoryList();
});

// 获取解析接口及默认接口
const getAnalysisApi = async () => {
  const [allRes, defaultAnalyzeRes, analyzeSupportRes] = await Promise.all([
    analyze.all(),
    setting.get('defaultAnalyze'),
    setting.get('analyzeSupport'),
  ]);

  analysisApi.value = allRes.filter((item) => item.isActive);
  selectAnalysisApi.value = defaultAnalyzeRes;
  isSupport.value = analyzeSupportRes;
};

// 获取解析历史
const getHistoryList = async () => {
  const { pageIndex, pageSize } = pagination.value;
  const res = await analyzeHistory.pagination(pageIndex, pageSize);
  const { list } = res;
  historyList.value = _.unionWith(historyList.value, list, _.isEqual);

  pagination.value.count = res.total;
  pagination.value.pageIndex++;

  return _.size(res.list);
};

const load = async ($state) => {
  console.log('loading...');
  try {
    const resLength = await getHistoryList();
    if (resLength === 0) $state.complete();
    else $state.loaded();
  } catch (err) {
    console.error(err);
    $state.error();
  }
};

// 解析函数抽离
const getVideoInfo = async () => {
  if (!selectAnalysisApi.value || !analysisUrl.value) {
    MessagePlugin.error('请选择解析接口或输入需要解析的地址');
    return;
  }

  const api = _.find(analysisApi.value, { id: selectAnalysisApi.value });
  if (!api) {
    MessagePlugin.error('无效的解析接口');
    return;
  }

  const url = `${api?.url}${analysisUrl.value}`;
  urlTitle.value = await zy.getAnalysizeTitle(analysisUrl.value);
  MessagePlugin.info('正在加载当前视频，如遇解析失败请切换线路!');

  const res = await analyzeHistory.find({ analyzeId: selectAnalysisApi.value, videoUrl: analysisUrl.value });
  if (res) {
    const index = _.findIndex(historyList.value, res);
    if (index > -1) historyList.value[index].date = moment().format('YYYY-MM-DD');
    await analyzeHistory.update(res.id, { date: moment().format('YYYY-MM-DD') });
  } else {
    const doc = {
      date: moment().format('YYYY-MM-DD'),
      analyzeId: selectAnalysisApi.value,
      videoUrl: analysisUrl.value,
      videoName: urlTitle.value,
    };
    historyList.value.unshift(doc);
    await analyzeHistory.add(doc);
  }

  return url;
};

// 直接解析
const analysisEvent = async () => {
  const url = await getVideoInfo();
  if (url) {
    iframeUrl.value = url;
  }
};

// 平台回掉解析
const platformPlay = async (item) => {
  analysisUrl.value = item;
  const url = await getVideoInfo();
  if (url) {
    iframeUrl.value = url;
  }
};

// 历史解析
const historyPlayEvent = async (item) => {
  const api = _.find(analysisApi.value, { id: item.analyzeId });
  if (!api) {
    MessagePlugin.error('该历史记录解析接口已删除');
    return;
  }

  urlTitle.value = item.videoName;
  analysisUrl.value = item.videoUrl;
  iframeUrl.value = `${api?.url}${item.videoUrl}`;
  const index = _.findIndex(historyList.value, item);
  if (index > -1) historyList.value[index].date = moment().format('YYYY-MM-DD');
  await analyzeHistory.update(item.id, { date: moment().format('YYYY-MM-DD') });
  MessagePlugin.info('正在加载当前视频，如遇解析失败请切换线路!');
};

// 历史删除
const histroyDeleteEvent = async (item) => {
  const index = historyList.value.findIndex((historyItem) => historyItem.id === item.id);
  if (index !== -1) {
    historyList.value.splice(index, 1);
    await analyzeHistory.remove(item.id);
  }
};

// 历史清空
const histroyClearEvent = async () => {
  try {
    await analyzeHistory.clear();
    historyList.value = [];
    MessagePlugin.success('sucess');
  } catch (err) {
    console.error(err);
    MessagePlugin.error('failed');
  }
};

// 显示支持平台
const showSupportEvent = async () => {
  isSupport.value = !isSupport.value;
  await setting.update({ analyzeSupport: isSupport.value });
};

// 打开平台iframe
const openPlatform = (item) => {
  const { name, url } = item;
  platformAnalysisData.value = { name, url };
  console.log(platformAnalysisData.value);
  formDialogVisiblePlatformAnalysis.value = true;
};

// 打开当前播放地址
const openCurrentUrl = () => {
  if (analysisUrl.value) {
    openPlatform({
      url: analysisUrl.value,
      name: urlTitle.value,
    });
  }
};

// 监听设置默认源变更
const eventBus = useEventBus('analyze-reload');
eventBus.on(async () => {
  getAnalysisApi();
});
</script>

<style lang="less" scoped>
@import '@/style/variables.less';
@import '@/style/index.less';

.analysis-container {
  width: 100%;
  height: calc(100vh - var(--td-comp-size-l));
  .analysis-main {
    .analysis-main-header {
      line-height: 42px;
      font-weight: 500;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .play_title {
        cursor: pointer;
      }
      svg {
        cursor: pointer;
      }
      .history-items {
        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          white-space: nowrap;
          font-weight: 500;
          cursor: pointer;
        }
        .date {
          width: 85px;
        }
        .title {
          padding: 0 10px;
          flex: 1 1 auto;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
    .analysis-main-play {
      .analysis-play-box-show {
        height: calc(100vh - 10em);
      }
      .analysis-play-box-hidden {
        height: calc(100vh - 15em);
      }
      .analysis-play-box {
        width: 100%;
        background-color: #f5f5f7;
        border-radius: var(--td-radius-extraLarge);
      }
      .analysis-setting {
        &-group {
          position: relative;
          height: 40px;
          padding: 0;
          border-radius: 20px;
          background-color: #f5f5f7;
          :deep(.t-input-adornment__prepend) {
            border-radius: 20px 0 0 20px;
            background-color: rgba(0, 0, 0, 0);
            .t-input {
              border: none;
              outline: none;
            }
            .t-input--focused {
              box-shadow: none;
              color: none;
            }
          }
          .analysis-url {
            overflow: visible;
            outline: none;
            border: 0;
            background: none;
            width: 100%;
            font-size: 15px;
            line-height: 40px;
            color: #99999a;
          }
          :deep(.t-input-adornment__append) {
            background: linear-gradient(90deg, var(--td-brand-color-4), var(--td-brand-color));
            border-radius: 20px;
            .analysis-play {
              cursor: pointer;
              display: inline-block;
              width: 82px;
              .analysis-tip {
                display: block;
                color: hsl(0deg 0% 0% / 60%);
                font-size: 15px;
                line-height: 40px;
                text-align: center;
              }
            }
          }
        }
      }
    }
    .analysis-main-bottom {
      .support-title {
        .support-separator {
          border: 0.1rem solid var(--td-brand-color);
          border-radius: var(--td-radius-default);
        }
        .support-tip {
          margin-left: 5px;
          display: inline-block;
          text-align: left;
          line-height: 40px;
          a {
            font-weight: 500;
          }
        }
      }
      .support-platform {
        display: flex;
      }
      .logo-item {
        cursor: pointer;
        margin-right: 8px;
        border-radius: var(--td-radius-default);
        background: var(--td-text-color-anti);
        img {
          width: 80px;
        }
      }
    }
  }
}
:root[theme-mode='dark'] {
  .analysis-play-box {
    background-color: var(--td-bg-color-container) !important;
  }
  .analysis-setting-group {
    background-color: var(--td-bg-color-container) !important;
  }
}
</style>
