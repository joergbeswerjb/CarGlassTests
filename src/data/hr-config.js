// HR Config - описание отображения каждой роли в HR-панели
// Чтобы добавить новую роль в HR-панель - добавить запись в HR_CONFIG.
// Никаких изменений в HRPage.jsx или CandidateCardPage.jsx не требуется.

export const HR_CONFIG = {

  'technician': {
    slug: 'technician',
    sheetName: 'Техник филиала',
    label: 'Техник филиала',
    listColumns: [
      { key: 'Имя',         label: 'Имя',     width: '22%'                        },
      { key: 'Дата',        label: 'Дата',    width: '14%', format: 'date'        },
      { key: 'Когн. %',     label: 'Cog%',    width: '10%', format: 'pct'         },
      { key: 'DISC осн.',   label: 'DISC',    width: '10%'                        },
      { key: 'Визуал. %',   label: 'Vis%',    width: '10%', format: 'pct'         },
      { key: 'Итог %',      label: 'Итог',    width: '10%', format: 'pct'         },
      { key: 'Ранг',        label: 'Ранг',    width: '10%', format: 'rank-badge'  },
    ],
    cardSummary: [
      { key: 'Итог %',      label: 'Итог',    format: 'pct'         },
      { key: 'Ранг',        label: 'Ранг',    format: 'rank-badge'  },
      { key: 'DISC осн.',   label: 'DISC'                            },
    ],
    cardBlocks: ['cognitive', 'disc', 'visual'],
    aiSections: [],
  },

  'operations-director': {
    slug: 'operations-director',
    sheetName: 'Операционный директор',
    label: 'Операционный директор',
    listColumns: [
      { key: 'Имя',         label: 'Имя',     width: '20%'                          },
      { key: 'Дата',        label: 'Дата',    width: '12%', format: 'date'          },
      { key: 'Когн. %',     label: 'Cog%',    width: '8%',  format: 'pct'           },
      { key: 'DISC осн.',   label: 'DISC',    width: '8%'                            },
      { key: 'Итог %',      label: 'Итог',    width: '8%',  format: 'pct'           },
      { key: 'Ранг',        label: 'Ранг',    width: '8%',  format: 'rank-badge'    },
      { key: 'Гейт',        label: 'Гейт',    width: '14%', format: 'gate-status'   },
    ],
    cardSummary: [
      { key: 'Итог %',      label: 'Итог',    format: 'pct'           },
      { key: 'Ранг',        label: 'Ранг',    format: 'rank-badge'    },
      { key: 'DISC осн.',   label: 'DISC'                              },
      { key: 'Гейт',        label: 'Гейт',    format: 'gate-status'   },
    ],
    cardBlocks: [
      'cognitive-extended',
      'disc-extended',
      'visual-extended',
      'structuring',
      'communication',
    ],
    aiSections: ['flags', 'interview-script', 'final-analysis'],
  },

  'office-universal': {
    slug: 'office-universal',
    sheetName: 'Офис универсальный',
    label: 'Офисные позиции',
    listColumns: [
      { key: 'Имя',           label: 'Имя',      width: '22%'                        },
      { key: 'Вакансия',      label: 'Вакансия', width: '18%'                        },
      { key: 'Дата',          label: 'Дата',     width: '14%', format: 'date'        },
      { key: 'Когнитивный',   label: 'Ког.',     width: '10%'                        },
      { key: 'Ког. уровень',  label: 'Уровень',  width: '12%'                        },
      { key: 'DISC осн.',     label: 'DISC',     width: '10%'                        },
      { key: 'Гейт',          label: 'Гейт',     width: '14%', format: 'gate-status' },
    ],
    // Композитного балла и ранга нет намеренно: DISC описательный,
    // сворачивать характер в единое число значило бы сделать его приговором.
    cardSummary: [
      { key: 'Вакансия',      label: 'Вакансия'                          },
      { key: 'Когнитивный',   label: 'Когнитивка'                        },
      { key: 'Ког. уровень',  label: 'Уровень'                           },
      { key: 'DISC осн.',     label: 'DISC'                              },
      { key: 'Гейт',          label: 'Гейт',     format: 'gate-status'   },
    ],
    cardBlocks: ['cognitive-tiered', 'disc-basic'],
    aiSections: [],
  },

  'chief-of-staff': {
    slug: 'chief-of-staff',
    sheetName: 'Помощник ГД / Chief of Staff',
    label: 'Помощник ГД / Chief of Staff',
    listColumns: [
      { key: 'Имя',         label: 'Имя',     width: '22%'                          },
      { key: 'Дата',        label: 'Дата',    width: '12%', format: 'date'          },
      { key: 'Когн. %',     label: 'Cog%',    width: '10%', format: 'pct'           },
      { key: 'DISC осн.',   label: 'DISC',    width: '10%'                          },
      { key: 'Итог %',      label: 'Итог',    width: '10%', format: 'pct'           },
      { key: 'Ранг',        label: 'Ранг',    width: '10%', format: 'rank-badge'    },
      { key: 'Гейт',        label: 'Гейт',    width: '14%', format: 'gate-status'   },
    ],
    cardSummary: [
      { key: 'Итог %',      label: 'Итог',    format: 'pct'           },
      { key: 'Ранг',        label: 'Ранг',    format: 'rank-badge'    },
      { key: 'DISC осн.',   label: 'DISC'                              },
      { key: 'Гейт',        label: 'Гейт',    format: 'gate-status'   },
    ],
    cardBlocks: [
      'cognitive-extended',
      'disc-extended',
      'case-study',
      'prioritization',
    ],
    aiSections: ['flags', 'interview-script', 'final-analysis'],
    // Описание открытых блоков CoS для обобщённого рендерера BlockOpenFields
    openBlocks: {
      'case-study': {
        title: 'Кейс-аналитика + письмо EN',
        fields: [
          { key: 'Кейс: сравнение RU', label: 'Сравнение поставщиков (RU)', mono: true },
          { key: 'Кейс: письмо EN',    label: 'Письмо головному офису (EN)'            },
        ],
      },
      'prioritization': {
        title: 'Приоритизация',
        fields: [
          { key: 'Приоритизация', label: 'Три задачи на сегодня + что откладывает и почему' },
        ],
      },
    },
  },

  'key-account-manager': {
    slug: 'key-account-manager',
    sheetName: 'Менеджер по ключевым клиентам (B2B)',
    label: 'Менеджер по ключевым клиентам (B2B)',
    listColumns: [
      { key: 'Имя',         label: 'Имя',     width: '22%'                          },
      { key: 'Дата',        label: 'Дата',    width: '12%', format: 'date'          },
      { key: 'Когн. %',     label: 'Cog%',    width: '10%', format: 'pct'           },
      { key: 'DISC осн.',   label: 'DISC',    width: '10%'                          },
      { key: 'Итог %',      label: 'Итог',    width: '10%', format: 'pct'           },
      { key: 'Ранг',        label: 'Ранг',    width: '10%', format: 'rank-badge'    },
      { key: 'Гейт',        label: 'Гейт',    width: '14%', format: 'gate-status'   },
    ],
    cardSummary: [
      { key: 'Итог %',      label: 'Итог',    format: 'pct'           },
      { key: 'Ранг',        label: 'Ранг',    format: 'rank-badge'    },
      { key: 'DISC осн.',   label: 'DISC'                              },
      { key: 'Гейт',        label: 'Гейт',    format: 'gate-status'   },
    ],
    cardBlocks: [
      'cognitive-extended',
      'disc-extended',
      'commercial',
      'communication-cases',
    ],
    aiSections: ['flags', 'interview-script', 'final-analysis'],
    // Открытые блоки KAM для обобщённого рендерера BlockOpenFields.
    // key = имя предметной колонки в листе (сырой ответ первичен).
    openBlocks: {
      'commercial': {
        title: 'Коммерческое суждение',
        fields: [
          { key: 'Кейс: первая сделка',      label: 'Первая сделка'                       },
          { key: 'Кейс: заход на рынок',     label: 'Заход на рынок (локальный B2B-рынок)' },
          { key: 'Кейс: приоритеты запуска', label: 'Приоритеты запуска'                  },
        ],
      },
      'communication-cases': {
        title: 'Коммуникация / переговоры',
        fields: [
          { key: 'Комм.: барьер доверия', label: 'Барьер доверия'          },
          { key: 'Комм.: срыв SLA',       label: 'Партнёр после срыва SLA' },
        ],
      },
    },
  },

  // Будущие роли добавлять по образцу:
  // 'cfo':    { slug, sheetName, label, listColumns, cardSummary, cardBlocks, aiSections }
  // 'gm':     { slug, sheetName, label, listColumns, cardSummary, cardBlocks, aiSections }
}

// Порядок отображения ролей в переключателе HR-панели
export const HR_ROLES_ORDER = ['operations-director', 'chief-of-staff', 'key-account-manager', 'office-universal', 'technician']
