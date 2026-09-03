import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  Tooltip,
  TableContainer,
  Paper,
  Box,
  Typography,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import { sessionActions } from '../store';

const useStyles = makeStyles()((theme) => ({
  columnAction: {
    width: 44,
    paddingLeft: theme.spacing(1),
  },
}));

const LogsPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  useEffect(() => {
    dispatch(sessionActions.enableLogs(true));
    return () => dispatch(sessionActions.enableLogs(false));
  }, [dispatch]);

  const items = useSelector((state) => state.session.logs);

  const registerDevice = (uniqueId) => {
    const query = new URLSearchParams({ uniqueId });
    navigate(`/settings/device?${query.toString()}`);
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'sharedLogs']}>
      <Box sx={{ p: { xs: 1.5, sm: 2.5 }, width: '100%' }}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '12px',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                }}
              >
                <TableCell className={classes.columnAction} />
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                    py: 1.5,
                  }}
                >
                  {t('deviceIdentifier')}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                    py: 1.5,
                  }}
                >
                  {t('positionProtocol')}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                    py: 1.5,
                  }}
                >
                  {t('commandData')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items && items.length > 0 ? (
                items.map((item, index) => (
                  <TableRow
                    key={index}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <TableCell className={classes.columnAction} padding="none">
                      {item.deviceId ? (
                        <IconButton color="success" size="small" disabled sx={{ opacity: 0.8 }}>
                          <CheckCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        <Tooltip title={t('loginRegister')} arrow>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => registerDevice(item.uniqueId)}
                          >
                            <HelpOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        color: 'text.primary',
                        py: 1.25,
                      }}
                    >
                      {item.uniqueId}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '0.825rem',
                        color: 'text.secondary',
                        py: 1.25,
                      }}
                    >
                      {item.protocol}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        wordBreak: 'break-all',
                        color: 'text.primary',
                        py: 1.25,
                      }}
                    >
                      {item.data}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <TerminalIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {t('sharedNoData')}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Menunggu lalu lintas data dari perangkat...
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </PageLayout>
  );
};

export default LogsPage;
