import { useRef, useState } from 'react';
import { Button, ButtonGroup, Menu, MenuItem, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const SplitButton = ({
  fullWidth,
  variant = 'contained',
  color = 'primary',
  disabled,
  onClick,
  options,
  selected,
  setSelected,
  sx,
  ...props
}) => {
  const anchorRef = useRef();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  return (
    <>
      <ButtonGroup
        fullWidth={fullWidth}
        variant={variant}
        color={color}
        ref={anchorRef}
        sx={{
          borderRadius: '10px',
          boxShadow: 'none',
          '& .MuiButtonGroup-grouped': {
            borderColor: (theme) =>
              variant === 'contained' ? 'rgba(255, 255, 255, 0.25)' : theme.palette.divider,
          },
          ...sx,
        }}
        {...props}
      >
        <Button
          disabled={disabled}
          onClick={() => onClick(selected)}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            px: 2,
            boxShadow: 'none',
          }}
        >
          <Typography variant="button" noWrap sx={{ textTransform: 'none', fontWeight: 600 }}>
            {options[selected]}
          </Typography>
        </Button>
        <Button
          fullWidth={false}
          size="small"
          disabled={disabled}
          onClick={() => setMenuAnchorEl(anchorRef.current)}
          sx={{
            px: 0.75,
            minWidth: 36,
            boxShadow: 'none',
          }}
        >
          <ArrowDropDownIcon fontSize="small" />
        </Button>
      </ButtonGroup>

      <Menu
        open={!!menuAnchorEl}
        anchorEl={menuAnchorEl}
        onClose={() => setMenuAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 0.75,
              borderRadius: '12px',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              minWidth: 160,
              py: 0.5,
            },
          },
        }}
      >
        {Object.entries(options).map(([key, value]) => (
          <MenuItem
            key={key}
            selected={key === selected}
            onClick={() => {
              setSelected(key);
              setMenuAnchorEl(null);
            }}
            sx={{
              fontSize: '0.85rem',
              py: 1,
              px: 2,
              '&.Mui-selected': {
                fontWeight: 600,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(25, 118, 210, 0.18)'
                    : 'rgba(25, 118, 210, 0.08)',
              },
            }}
          >
            {value}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default SplitButton;
