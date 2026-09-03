import { makeStyles } from 'tss-react/mui';

export default makeStyles()((theme) => ({
  table: {
    marginBottom: theme.spacing(10),
    '& .MuiTableRow-root': {
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
      },
    },
    '& .MuiTableCell-root': {
      padding: theme.spacing(1.5, 2),
    },
  },
  columnAction: {
    width: '1%',
    whiteSpace: 'nowrap',
    paddingRight: theme.spacing(2),
  },
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(6),
    maxWidth: '780px !important', // Melebarkan form agar proporsional di layar desktop
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
    marginBottom: theme.spacing(3),
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1.5),
    '& > *': {
      minWidth: 120,
    },
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    padding: theme.spacing(2.5),
  },
  verticalActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
}));
