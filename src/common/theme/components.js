export default {
  MuiUseMediaQuery: {
    defaultProps: {
      noSsr: true,
    },
  },
  MuiPaper: {
    styleOverrides: {
      rounded: {
        borderRadius: '12px',
      },
      elevation1: ({ theme }) => ({
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 20px rgba(0, 0, 0, 0.4)'
          : '0 4px 16px rgba(15, 23, 42, 0.06)',
        border: `1px solid ${theme.palette.divider}`,
      }),
    },
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(15, 23, 42, 0.04)',
      }),
    },
  },
  MuiAccordion: {
    defaultProps: {
      disableGutters: true,
      elevation: 0,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: '14px !important',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 2px 10px rgba(15, 23, 42, 0.04)',
        overflow: 'hidden',
        marginBottom: theme.spacing(2),
        '&:before': {
          display: 'none',
        },
      }),
    },
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(0.5, 2.5),
        fontWeight: 600,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
      }),
    },
  },
  MuiAccordionDetails: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(2, 2.5, 3),
        backgroundColor: theme.palette.background.paper,
      }),
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: '10px',
        backgroundColor: theme.palette.background.paper,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }),
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: '10px',
        textTransform: 'none',
        fontWeight: 600,
        transition: 'all 0.2s ease-in-out',
      },
      sizeMedium: {
        height: '42px',
        padding: '8px 18px',
      },
      containedPrimary: {
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(27, 42, 74, 0.25)',
        },
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: '16px',
      },
    },
  },
  MuiFormControl: {
    defaultProps: {
      size: 'small',
    },
  },
  MuiSnackbar: {
    defaultProps: {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center',
      },
    },
  },
  MuiTooltip: {
    defaultProps: {
      enterDelay: 500,
      enterNextDelay: 500,
    },
    styleOverrides: {
      tooltip: {
        borderRadius: '8px',
        fontSize: '0.75rem',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderColor: theme.palette.divider,
        '@media print': {
          color: theme.palette.alwaysDark.main,
        },
      }),
      head: {
        fontWeight: 600,
      },
    },
  },
};
