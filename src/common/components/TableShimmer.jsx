import { forwardRef, Fragment } from 'react';
import { Skeleton, TableCell, TableRow, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

const TableShimmer = forwardRef(({ columns, startAction, endAction, rows = 5 }, ref) => (
  <Fragment>
    {[...Array(rows)].map((_, i) => (
      <TableRow
        key={`shimmer-row-${i}`}
        ref={i === 0 ? ref : null}
        sx={{
          '&:last-child td, &:last-child th': { border: 0 },
        }}
      >
        {[...Array(columns)].map((_, j) => {
          const isStartAction = startAction && j === 0;
          const isEndAction = endAction && j === columns - 1;
          const isAction = isStartAction || isEndAction;

          return (
            <TableCell
              key={`shimmer-cell-${i}-${j}`}
              padding={isAction ? 'none' : 'normal'}
              sx={{
                py: 1.5,
                borderColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(15, 23, 42, 0.06)',
                ...(isAction && { px: 1.25 }),
              }}
            >
              {isAction ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Skeleton
                    variant="circular"
                    width={30}
                    height={30}
                    animation="wave"
                    sx={{
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.08)'
                          : alpha('#0f172a', 0.06),
                    }}
                  />
                </Box>
              ) : (
                <Skeleton
                  variant="text"
                  animation="wave"
                  height={22}
                  sx={{
                    borderRadius: '8px',
                    transform: 'none',
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.07)'
                        : alpha('#0f172a', 0.05),
                    width: `${60 + ((i + j) % 4) * 12}%`,
                  }}
                />
              )}
            </TableCell>
          );
        })}
      </TableRow>
    ))}
  </Fragment>
));

TableShimmer.displayName = 'TableShimmer';

export default TableShimmer;
