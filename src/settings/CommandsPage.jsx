import { useCallback, useReducer, useState } from 'react';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAsyncTask, useScrollToLoad, pageSize } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import { prefixString } from '../common/util/stringUtils';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader from './components/SearchHeader';
import { useRestriction } from '../common/util/permissions';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const CommandsPage = () => {
  const { classes } = useSettingsStyles();
  const theme = useTheme();
  const t = useTranslation();

  const [reloadKey, reload] = useReducer((k) => k + 1, 0);
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const limitCommands = useRestriction('limitCommands');

  const loadItems = useCallback(
    async (offset, signal) => {
      const query = new URLSearchParams({ limit: pageSize, offset });
      if (searchKeyword) {
        query.append('keyword', searchKeyword);
      }
      const response = await fetchOrThrow(`/api/commands?${query.toString()}`, { signal });
      const data = await response.json();
      setItems((previous) => (offset ? [...previous, ...data] : data));
      setHasMore(data.length >= pageSize);
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

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedSavedCommands']}>
      <Box
        sx={{
          width: '100%',
          p: { xs: 2, sm: 3, md: 4 },
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Box sx={{ mb: 2.5 }}>
            <SearchHeader keyword={searchKeyword} setKeyword={searchKeyword} />
          </Box>

          <Box
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: '16px',
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
              mb: 4,
              width: '100%',
            }}
          >
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <Table
                className={classes.table}
                sx={{
                  minWidth: 600,
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  '& .MuiTableHead-root .MuiTableCell-root': {
                    backgroundColor:
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    py: 1.8,
                    px: 2.5,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    whiteSpace: 'nowrap',
                  },
                  '& .MuiTableBody-root .MuiTableRow-root': {
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                      backgroundColor:
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                    },
                  },
                  '& .MuiTableBody-root .MuiTableCell-root': {
                    py: 1.8,
                    px: 2.5,
                    fontSize: '0.875rem',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>{t('sharedDescription')}</TableCell>
                    <TableCell>{t('sharedType')}</TableCell>
                    <TableCell>{t('commandSendSms')}</TableCell>
                    {!limitCommands && <TableCell className={classes.columnAction} align="right" />}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {item.description || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                        {t(prefixString('command', item.type))}
                      </TableCell>
                      <TableCell>
                        {item.textChannel ? (
                          <Chip
                            label="SMS"
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 24,
                              backgroundColor: 'rgba(34, 197, 94, 0.12)',
                              color: '#16a34a',
                              borderRadius: '6px',
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      {!limitCommands && (
                        <TableCell className={classes.columnAction} padding="none" align="right">
                          <CollectionActions
                            itemId={item.id}
                            editPath="/settings/command"
                            endpoint="commands"
                            onReload={reload}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {hasMore && (
                    <TableShimmer
                      ref={items.length > 0 ? sentinelRef : null}
                      columns={limitCommands ? 3 : 4}
                      endAction
                    />
                  )}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </Box>
      </Box>

      <CollectionFab editPath="/settings/command" disabled={limitCommands} />
    </PageLayout>
  );
};

export default CommandsPage;
