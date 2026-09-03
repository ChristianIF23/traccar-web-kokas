import { Skeleton, TableCell, TableRow, Box } from '@mui/material';

const TableShimmer = ({ columns, startAction, endAction, rows = 5, ref }) =>
  [...Array(rows)].map((_, i) => (
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
              py: 1.25,
              ...(isAction && { px: 1 }),
            }}
          >
            {isAction ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Skeleton
                  variant="circular"
                  width={28}
                  height={28}
                  animation="wave"
                  sx={{ my: 0.25 }}
                />
              </Box>
            ) : (
              <Skeleton
                variant="text"
                animation="wave"
                height={22}
                sx={{
                  borderRadius: '6px',
                  transform: 'none',
                  // Buat variasi lebar acak halus agar tampak natural seperti data teks asli
                  width: `${65 + ((i + j) % 4) * 10}%`,
                }}
              />
            )}
          </TableCell>
        );
      })}
    </TableRow>
  ));

export default TableShimmer;
