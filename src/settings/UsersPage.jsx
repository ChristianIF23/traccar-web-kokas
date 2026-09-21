import { useCallback, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Switch,
  TableFooter,
  FormControlLabel,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LinkIcon from '@mui/icons-material/Link';
import { alpha, useTheme } from '@mui/material/styles';
import { useCatch, useAsyncTask, useScrollToLoad, pageSize } from '../reactHelper';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import { useManager } from '../common/util/permissions';
import SearchHeader from './components/SearchHeader';
import fetchOrThrow from '../common/util/fetchOrThrow';
import UserDevicesValue from './components/UserDevicesValue';

const UsersPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();
  const isDark = theme.palette.mode === 'dark';

  const manager = useManager();

  const [reloadKey, reload] = useReducer((k) => k + 1, 0);
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [temporary, setTemporary] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCatch(async (userId) => {
    await fetchOrThrow(`/api/session/${userId}`);
    window.location.replace('/');
  });

  const actionLogin = {
    key: 'login',
    title: t('loginLogin'),
    icon: <LoginIcon fontSize="small" />,
    handler: handleLogin,
  };

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (userId) => navigate(`/settings/user/${userId}/connections`),
  };

  const loadItems = useCallback(
    async (offset, signal) => {
      setLoading(true);
      try {
        const query = new URLSearchParams({ excludeAttributes: true, limit: pageSize, offset });
        if (searchKeyword) {
          query.append('keyword', searchKeyword);
        }
        const response = await fetchOrThrow(`/api/users?${query.toString()}`, { signal });
        const data = await response.json();
        setItems((previous) => (offset ? [...previous, ...data] : data));
        setHasMore(data.length >= pageSize);
      } finally {
        setLoading(false);
      }
    },
    [searchKeyword],
  );

  const sentinelRef = useScrollToLoad(() => loadItems(items.length));

  useAsyncTask(
    async ({ signal }) => {
      void reloadKey;
      setItems([]);
      await loadItems(0, signal);
    },
    [reloadKey, loadItems],
  );

  const filteredItems = items.filter((u) => temporary || !u.temporary);

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsUsers']}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />

        <Box
          sx={{
            backgroundColor: isDark ? '#162447' : '#ffffff',
            borderRadius: '18px',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'}`,
            overflow: 'hidden',
            boxShadow: isDark
              ? '0 12px 30px rgba(0, 0, 0, 0.45)'
              : '0 8px 24px rgba(15, 23, 42, 0.04)',
            width: '100%',
          }}
        >
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <Table
              sx={{
                minWidth: 700,
                borderCollapse: 'separate',
                borderSpacing: 0,
                '& .MuiTableHead-root .MuiTableCell-root': {
                  backgroundColor: isDark ? alpha('#0f172a', 0.6) : alpha('#f8fafc', 0.9),
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  py: 1.5,
                  px: 2,
                  borderBottom: `1px solid ${
                    isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)'
                  }`,
                  whiteSpace: 'nowrap',
                },
                '& .MuiTableBody-root .MuiTableRow-root': {
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    backgroundColor: isDark ? alpha('#1d4ed8', 0.08) : alpha('#1d4ed8', 0.03),
                  },
                  '&:last-child .MuiTableCell-root': {
                    borderBottom: hasMore ? undefined : 'none',
                  },
                },
                '& .MuiTableBody-root .MuiTableCell-root': {
                  py: 1.4,
                  px: 2,
                  fontSize: '0.86rem',
                  borderBottom: `1px solid ${
                    isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)'
                  }`,
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>{t('sharedName')}</TableCell>
                  <TableCell>{t('userEmail')}</TableCell>
                  <TableCell>{t('sharedRole')}</TableCell>
                  <TableCell>{t('sharedStatus')}</TableCell>
                  <TableCell>{t('userExpirationTime')}</TableCell>
                  <TableCell>{t('deviceTitle')}</TableCell>
                  <TableCell align="right" sx={{ width: 90, pr: 2 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{item.email}</TableCell>
                    <TableCell>
                      {item.administrator ? (
                        <Chip
                          label={t('userAdmin')}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 22,
                            backgroundColor: alpha('#1d4ed8', 0.15),
                            color: '#3b82f6',
                            borderRadius: '8px',
                            border: `1px solid ${alpha('#1d4ed8', 0.25)}`,
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {t('userUser')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.disabled ? (
                        <Chip
                          label={t('sharedDisabled')}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 22,
                            backgroundColor: alpha('#ef4444', 0.15),
                            color: '#ef4444',
                            borderRadius: '8px',
                            border: `1px solid ${alpha('#ef4444', 0.25)}`,
                          }}
                        />
                      ) : (
                        <Chip
                          label={t('deviceStatusOnline') || 'Aktif'}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 22,
                            backgroundColor: alpha('#10b981', 0.15),
                            color: '#10b981',
                            borderRadius: '8px',
                            border: `1px solid ${alpha('#10b981', 0.25)}`,
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {formatTime(item.expirationTime, 'date') || '—'}
                    </TableCell>
                    <TableCell>
                      <UserDevicesValue userId={item.id} />
                    </TableCell>
                    <TableCell padding="none" align="right" sx={{ pr: 2 }}>
                      <CollectionActions
                        itemId={item.id}
                        editPath="/settings/user"
                        endpoint="users"
                        onReload={reload}
                        customActions={
                          manager ? [actionLogin, actionConnections] : [actionConnections]
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('sharedNoData')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {hasMore && (
                  <TableShimmer ref={items.length > 0 ? sentinelRef : null} columns={7} endAction />
                )}
              </TableBody>
              <TableFooter>
                <TableRow
                  sx={{
                    '& .MuiTableCell-root': {
                      py: 1.25,
                      px: 2,
                      borderTop: `1px solid ${
                        isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)'
                      }`,
                      borderBottom: 'none',
                    },
                  }}
                >
                  <TableCell colSpan={7} align="right">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={temporary}
                          onChange={(e) => setTemporary(e.target.checked)}
                          size="small"
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#1d4ed8',
                              '& + .MuiSwitch-track': {
                                backgroundColor: '#1d4ed8',
                              },
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {t('userTemporary')}
                        </Typography>
                      }
                      labelPlacement="start"
                    />
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Box>
        </Box>
      </Box>

      <CollectionFab editPath="/settings/user" />
    </PageLayout>
  );
};

export default UsersPage;
