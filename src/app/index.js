import React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import { getCookie } from '../helpers';
import Anilist from '../anilist';
import Kitsu from '../kitsu';
import MAL from '../mal';
import Bangumi from '../bangumi';
import Modal from '../modal';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)') || getCookie('theme') === 'Dark';

  const theme = React.useMemo(
    () => createMuiTheme({
      palette: {
        type: prefersDarkMode ? 'dark' : 'light',
      },
    }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        {window?.komga?.enabledSources?.aniList && <Anilist />}
        {window?.komga?.enabledSources?.kitsu && <Kitsu />}
        {window?.komga?.enabledSources?.myAnimeList && <MAL />}
        {window?.komga?.enabledSources?.bangumi && <Bangumi />}
        <Modal />
      </div>
    </ThemeProvider>
  );
}

export default App;
