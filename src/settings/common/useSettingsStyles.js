import { makeStyles } from 'tss-react/mui';

export default makeStyles()((theme) => ({
  table: {
    borderCollapse: 'separate',
    borderSpacing: 0,
    '& .MuiTableRow-root': {
      transition: 'background-color 0.15s ease',
      '&:hover': {
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
      },
    },
    '& .MuiTableCell-root': {
      padding: theme.spacing(1.8, 2.5),
      fontSize: '0.875rem',
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  },
  columnAction: {
    width: '1%',
    whiteSpace: 'nowrap',
    paddingRight: theme.spacing(2.5),
  },
  container: {
    width: '100%',
    maxWidth: '960px !important',
    margin: '0 auto',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    paddingLeft: `${theme.spacing(3)} !important`,
    paddingRight: `${theme.spacing(3)} !important`,
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100% !important',
      paddingLeft: `${theme.spacing(2)} !important`,
      paddingRight: `${theme.spacing(2)} !important`,
    },
  },
  buttons: {
    marginTop: theme.spacing(3),
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1.5),
    '& > *': {
      minWidth: 100,
    },
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    padding: `${theme.spacing(3)} !important`,
  },
  verticalActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
}));
