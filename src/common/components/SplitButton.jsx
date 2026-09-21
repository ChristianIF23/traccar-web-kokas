import { useState, useRef } from 'react';
import {
  Button,
  ButtonGroup,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  ClickAwayListener,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const SplitButton = ({
  options,
  selected,
  setSelected,
  onClick,
  disabled,
  variant = 'contained',
  fullWidth = false,
  sx = {},
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleMenuItemClick = (key) => {
    setSelected(key);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <ButtonGroup
        variant={variant}
        disabled={disabled}
        ref={anchorRef}
        fullWidth={fullWidth}
        disableElevation
        sx={{
          height: '100%',
          borderRadius: '10px',
          overflow: 'hidden', // Memotong sudut tombol anak agar sejajar & rata
          display: 'flex',
          alignItems: 'stretch',
          ...sx,
        }}
      >
        <Button
          onClick={() => onClick(selected)}
          sx={{
            flexGrow: 1,
            height: '100%',
            borderRadius: 0,
            textTransform: 'none',
          }}
        >
          {options[selected]}
        </Button>
        <Button
          size="small"
          onClick={handleToggle}
          sx={{
            height: '100%',
            borderRadius: 0,
            minWidth: '36px',
            padding: 0,
          }}
        >
          <ArrowDropDownIcon sx={{ color: '#ffffff' }} />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        style={{ zIndex: 1300 }}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper sx={{ mt: 0.5, borderRadius: '8px', boxShadow: 3 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem>
                  {Object.entries(options).map(([key, value]) => (
                    <MenuItem
                      key={key}
                      selected={key === selected}
                      onClick={() => handleMenuItemClick(key)}
                    >
                      {value}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default SplitButton;
