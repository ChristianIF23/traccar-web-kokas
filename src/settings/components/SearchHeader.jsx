import { useState, useEffect, useRef } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from '../../common/components/LocalizationProvider';

const useStyles = makeStyles()((theme) => ({
  header: {
    position: 'sticky',
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: theme.spacing(2.5, 3, 2),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    zIndex: 2,
  },
  searchField: {
    maxWidth: 520,
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
      transition: 'all 0.2s ease-in-out',
      '& fieldset': {
        borderColor: theme.palette.divider,
      },
      '&:hover fieldset': {
        borderColor: theme.palette.primary.light,
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette.background.paper,
        boxShadow: `0 0 0 3px ${theme.palette.primary.main}1A`,
      },
    },
    '& .MuiOutlinedInput-input': {
      padding: '10px 14px',
      fontSize: '0.9rem',
    },
  },
  icon: {
    color: theme.palette.text.secondary,
    fontSize: 20,
  },
}));

const SearchHeader = ({ keyword, setKeyword }) => {
  const { classes } = useStyles();
  const t = useTranslation();

  const [input, setInput] = useState(keyword);
  const timerRef = useRef();

  useEffect(() => {
    timerRef.current = setTimeout(() => setKeyword(input), 500);
    return () => clearTimeout(timerRef.current);
  }, [input, setKeyword]);

  return (
    <div className={classes.header}>
      <TextField
        className={classes.searchField}
        variant="outlined"
        placeholder={t('sharedSearch')}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className={classes.icon} />
              </InputAdornment>
            ),
          },
        }}
      />
    </div>
  );
};

export default SearchHeader;
