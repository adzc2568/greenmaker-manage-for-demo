const routes = [
  {
    path: '/',
    redirect: process.env.PROD ? { name: 'SignIn' } : { name: 'WarehouseManage' },
    component: () => import('layouts/SignInLayout.vue'),
    children: [
      {
        path: 'SignIn',
        name: 'SignIn',
        component: () => import('src/pages/SignIn.vue'),
      },
      {
        path: 'Redirect',
        name: 'Redirect',
        component: () => import('src/pages/RedirectPage.vue'),
      },
    ],
  },
  {
    path: '/Admin',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'Article',
        name: 'Article',
        component: () => import('src/pages/Article/ArticleManage.vue'),
      },
      {
        path: 'CreateArticle/:_id?',
        name: 'CreateArticle',
        component: () => import('src/pages/Article/CreateArticle.vue'),
      },
      {
        path: 'ArticlePreview',
        name: 'ArticlePreview',
        component: () => import('src/pages/Article/ArticlePreview.vue'),
      },
      {
        path: 'ArticleTypeManage',
        name: 'ArticleTypeManage',
        component: () => import('src/pages/CommonData/CommonDataManage.vue'),
        props: {
          title: '文章類別',
          category: 'ArticleType',
        },
      },
      {
        path: 'IncomeAndExpense',
        name: 'IncomeAndExpense',
        component: () => import('src/pages/IncomeAndExpense/IncomeAndExpense.vue'),
      },
      {
        path: 'Plant',
        name: 'Plant',
        component: () => import('pages/Plant/PlantManage.vue'),
      },
      {
        path: 'TaxonomyManage',
        name: 'TaxonomyManage',
        component: () => import('pages/Taxonomy/TaxonomyManage.vue'),
      },
      {
        path: 'Commodity',
        name: 'Commodity',
        component: () => import('pages/Commodity/CommodityManage.vue'),
      },
      {
        path: 'CreateCommodity/:_id?',
        name: 'CreateCommodity',
        component: () => import('pages/Commodity/CreateCommodity.vue'),
      },

      {
        path: 'CommodityTypeManage',
        name: 'CommodityTypeManage',
        component: () => import('src/pages/CommonData/CommonDataManage.vue'),
        props: {
          title: '倉儲類別',
          category: 'CommodityType',
        },
      },
      {
        path: 'TagManage',
        name: 'TagManage',
        component: () => import('src/pages/CommonData/CommonDataManage.vue'),
        props: {
          title: '標籤',
          category: 'Tag',
        },
      },
      {
        path: 'WarehouseManage',
        name: 'WarehouseManage',
        component: () => import('src/pages/Warehouse/WarehouseManage.vue'),
      },
      {
        path: 'PurchaseOrderManage',
        name: 'PurchaseOrderManage',
        component: () => import('src/pages/PurchaseOrder/PurchaseOrderManage.vue'),
      },
      {
        path: 'ContactManage',
        name: 'ContactManage',
        component: () => import('src/pages/Contact/ContactManage.vue'),
      },
      {
        path: 'StockRecordManage',
        name: 'StockRecordManage',
        component: () => import('src/pages/StockRecord/StockRecordManage.vue'),
      },
      {
        path: 'WorkRecordManage',
        name: 'WorkRecordManage',
        component: () => import('src/pages/WorkRecord/WorkRecordManage.vue'),
      },
      {
        path: 'WorkEventManage',
        name: 'WorkEventManage',
        component: () => import('src/pages/CommonData/CommonDataManage.vue'),
        props: {
          title: '工作施作',
          category: 'WorkEvent',
        },
      },
      {
        path: 'SkuGroupAndSkuManage',
        name: 'SkuGroupAndSkuManage',
        component: () => import('src/pages/SkuGroupAndSku/SkuGroupAndSkuManage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    redirect: process.env.PROD ? { name: 'SignIn' } : { name: 'WarehouseManage' },
  },
]

export default routes

