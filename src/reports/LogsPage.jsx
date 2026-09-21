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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import { sessionActions } from '../store';

const LogsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  // Mengaktifkan stream/listener log saat halaman dibuka dan mematikannya saat di-unmount
  useEffect(() => {
    dispatch(sessionActions.enableLogs(true));
    return () => {
      dispatch(sessionActions.enableLogs(false));
    };
  }, [dispatch]);

  const items = useSelector((state) => state.session.logs);

  const registerDevice = (uniqueId) => {
    const query = new URLSearchParams({ uniqueId });
    navigate(`/settings/device?${query.toString()}`);
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'sharedLogs']}>
      <Box sx={{ p: { xs: 1.5, sm: 3 }, width: '100%', boxSizing: 'border-box' }}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '16px',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            overflow: 'hidden',
          }}
        >
          <Table
            size="small"
            sx={{
              minWidth: 700,
              borderCollapse: 'separate',
              borderSpacing: 0,
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  '& .MuiTableCell-root': {
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    py: 1.8,
                    px: 2.5,
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    whiteSpace: 'nowrap',
                  },
                }}
              >
                <TableCell sx={{ width: 52, px: 1.5 }} />
                <TableCell>{t('deviceIdentifier')}</TableCell>
                <TableCell>{t('positionProtocol')}</TableCell>
                <TableCell>{t('commandData')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items && items.length > 0 ? (
                items.map((item, index) => {
                  // Key dibuat lebih spesifik untuk menghindari bug re-render pada data WebSocket real-time
                  const rowKey = item.id || `${item.uniqueId}-${item.time || index}`;

                  return (
                    <TableRow
                      key={rowKey}
                      hover
                      sx={{
                        transition: 'background-color 0.15s ease',
                        '& .MuiTableCell-root': {
                          py: 1.5,
                          px: 2.5,
                          fontSize: '0.875rem',
                          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        },
                      }}
                    >
                      <TableCell padding="none" sx={{ width: 52, pl: 1.5 }}>
                        {item.deviceId ? (
                          <Tooltip title={t('deviceStatusOnline') || 'Registered'} arrow>
                            <span>
                              <IconButton
                                color="success"
                                size="small"
                                disabled
                                sx={{ borderRadius: '8px', p: 0.75, opacity: 0.85 }}
                              >
                                <CheckCircleOutlineIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip title={t('loginRegister')} arrow>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => registerDevice(item.uniqueId)}
                              sx={{ borderRadius: '8px', p: 0.75 }}
                            >
                              <HelpOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'text.primary',
                        }}
                      >
                        {item.uniqueId}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: '0.8125rem',
                          color: 'text.secondary',
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
                        }}
                      >
                        {item.data}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <TerminalIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
                      <Typography variant="body2" color="text.secondary">
                        {t('sharedNoData')}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Menunggu lalu lintas data dari perangkat...
                      </Typography>
                    </Box>
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
