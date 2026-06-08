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

  // Будущие роли добавлять по образцу:
  // 'cfo':    { slug, sheetName, label, listColumns, cardSummary, cardBlocks, aiSections }
  // 'gm':     { slug, sheetName, label, listColumns, cardSummary, cardBlocks, aiSections }
  // 'kam':    { slug, sheetName, label, listColumns, cardSummary, cardBlocks, aiSections }
}

// Порядок отображения ролей в переключателе HR-панели
export const HR_ROLES_ORDER = ['operations-director', 'technician']
