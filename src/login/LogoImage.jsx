import { useTheme, useMediaQuery } from '@mui/material';
import { useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import Logo from '../resources/images/logo.svg?react';

const useStyles = makeStyles()((theme) => ({
  image: {
    alignSelf: 'center',
    maxWidth: '100%',
    maxHeight: 48,
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
    display: 'block',
    transition: 'transform 0.2s ease',
  },
}));

const LogoImage = ({ color }) => {
  const theme = useTheme();
  const { classes } = useStyles();

  const expanded = !useMediaQuery(theme.breakpoints.down('lg'));

  const logo = useSelector((state) => state.session.server.attributes?.logo);
  const logoInverted = useSelector((state) => state.session.server.attributes?.logoInverted);

  if (logo) {
    if (expanded && logoInverted) {
      return <img className={classes.image} src={logoInverted} alt="Logo" />;
    }
    return <img className={classes.image} src={logo} alt="Logo" />;
  }
  return <Logo className={classes.image} style={{ color }} />;
};

export default LogoImage;
