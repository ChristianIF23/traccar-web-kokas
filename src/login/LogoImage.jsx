import { useTheme, useMediaQuery } from '@mui/material';
import { useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import Logo from '../resources/images/logo.svg?react';

const useStyles = makeStyles()((theme) => ({
  image: {
    alignSelf: 'center',
    maxWidth: '100%',
    maxHeight: 52, // Disesuaikan agar proporsional di sidebar
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
    [theme.breakpoints.down('md')]: {
      maxHeight: 40,
    },
  },
  svgLogo: {
    alignSelf: 'center',
    maxWidth: '100%',
    maxHeight: 52, // Disesuaikan agar proporsional di sidebar
    width: 'auto',
    height: 'auto',
    display: 'block',
    [theme.breakpoints.down('md')]: {
      maxHeight: 40,
    },
  },
}));

const LogoImage = ({ color }) => {
  const theme = useTheme();
  const { classes } = useStyles();

  const isDesktop = !useMediaQuery(theme.breakpoints.down('md'));

  const logo = useSelector((state) => state.session.server.attributes?.logo);
  const logoInverted = useSelector((state) => state.session.server.attributes?.logoInverted);

  if (logo) {
    if (isDesktop && logoInverted) {
      return <img className={classes.image} src={logoInverted} alt="Logo" />;
    }
    return <img className={classes.image} src={logo} alt="Logo" />;
  }

  const logoColor = color || (isDesktop ? '#ffffff' : theme.palette.primary.main);

  return <Logo className={classes.svgLogo} style={{ color: logoColor }} />;
};

export default LogoImage;
