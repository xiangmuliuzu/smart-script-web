/**
 * B 模块（内容与作品）枚举常量集中管理。
 * 供 PC「内容管理」各页筛选下拉与表单选项统一取用，杜绝各页各写映射。
 *
 * 取值出处（禁止编造，逐项标注）：
 * - WORK_TYPE（作品类型）：云端库 sys_work.work_type 实测值只有 script，取库内实际值。
 * - TRADE_TYPE（交易类型）：与若依字典 trade_license_type 对齐
 *   （exclusive 独家 / non_exclusive 非独家 / adaptation 改编）。
 *   依据 sql/smartscript_full_init.sql：negotiable「可议价」已退役为所有作品共有能力。
 * - CATEGORY_TYPE / TAG_TYPE：设计文档未定义枚举，采用内容侧约定的经典维度；
 *   App 端只按 parentId 取分类、不按类型筛选（见 content_providers.dart），故取值不影响 App。
 * - DRAMA_SOURCE_TYPE / DRAMA_AUTH_STATUS / DRAMA_SHELF_STATUS / BANNER_POSITION：
 *   取云端库 sys_external_drama / sys_banner 对应列实测值。
 * - RANKING_TYPE：取 App 端榜单四类（lib/features/bookstore/data/bookstore_models.dart），
 *   与云端 sys_ranking_snapshot.ranking_type 改名对齐（存量 view_rank/favorite_rank 由
 *   迁移脚本 B_20261009_007__rename_ranking_type.sql 收敛为 view/favorite）。
 */

/** 分类类型（sys_category.category_type） */
export const CATEGORY_TYPE = [
  { value: 'theme', label: '题材' },
  { value: 'style', label: '风格' },
  { value: 'audience', label: '受众' }
]

/** 标签类型（sys_tag.tag_type） */
export const TAG_TYPE = [
  { value: 'theme', label: '题材' },
  { value: 'audience', label: '受众' }
]

/** 作品类型（sys_work.work_type）：库内实际值 */
export const WORK_TYPE = [{ value: 'script', label: '剧本' }]

/** 交易类型（sys_work.trade_type）：与字典 trade_license_type 对齐 */
export const TRADE_TYPE = [
  { value: 'exclusive', label: '独家' },
  { value: 'non_exclusive', label: '非独家' },
  { value: 'adaptation', label: '改编' }
]

/** 外部视频来源类型（sys_external_drama.source_type） */
export const DRAMA_SOURCE_TYPE = [{ value: 'douyin', label: '抖音' }]

/** 外部视频授权状态（sys_external_drama.authorization_status） */
export const DRAMA_AUTH_STATUS = [{ value: 'authorized', label: '已授权' }]

/** 外部视频上/下架状态（sys_external_drama.status） */
export const DRAMA_SHELF_STATUS = [
  { value: 'on_shelf', label: '已上架' },
  { value: 'off_shelf', label: '已下架' }
]

/** Banner 展示位置（sys_banner.position） */
export const BANNER_POSITION = [
  { value: 'home_top', label: '首页顶部' },
  { value: 'home_middle', label: '首页中部' }
]

/** 榜单类型（sys_ranking_snapshot.ranking_type）：与 App 端四榜对齐，指标随类型固定 */
export const RANKING_TYPE = [
  { value: 'view', label: '热门榜', metricLabel: '阅读量' },
  { value: 'favorite', label: '收藏榜', metricLabel: '收藏量' },
  { value: 'sale', label: '交易热度榜', metricLabel: '交易量' },
  { value: 'rating', label: '评分榜', metricLabel: '评分' }
]

/** 取中文名，找不到回退原值 */
export function contentEnumLabel(list, value) {
  const item = (list || []).find((i) => i.value === value)
  return item ? item.label : (value ?? '—')
}