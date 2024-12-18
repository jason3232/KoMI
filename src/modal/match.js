/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { useDispatch, shallowEqual, useSelector } from 'react-redux';

import { Col, Row } from 'react-styled-flexboxgrid';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import {
  List, ListItem, ListItemText, ListSubheader,
} from '@material-ui/core';
import IconButton from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import { updateSelectedSeries } from '../actions';
import {
  selectSelectedSeries, selectSearchResults,
} from '../selectors';

import { getText } from '../helpers';

const Match = () => {
  const dispatch = useDispatch();
  const selectedSeries = useSelector(selectSelectedSeries, shallowEqual);
  const searchResults = useSelector(selectSearchResults, shallowEqual);

  const useStyles = makeStyles(() => ({
    flexWrapper: {
      display: 'flex',
    },
    iconButton: {
      padding: '6px 8px',
      minWidth: 'auto !important',
    },
    OpenInNewIcon: {
      fontSize: 'medium',
    },
    matchesList: {
      height: 350,
      overflowY: 'auto',
    },
  }));

  const updateMatch = (series) => {
    dispatch(updateSelectedSeries(series));
  };

  const goToMatch = () => {
    window.open(selectedSeries.siteUrl, '_blank');
  };

  const synonymLength = selectedSeries && selectedSeries.synonyms && selectedSeries.synonyms.length;
  const hasAltTitles = selectedSeries
    && selectedSeries.alternativeTitles
    && selectedSeries.alternativeTitles.length;
  const classes = useStyles();

  return (
    <Row>
      {!selectedSeries && <h2>No Results...</h2>}
      {selectedSeries
        && (
          <Col xs={8}>
            <div className={classes.flexWrapper}>
              <h2>Current Match</h2>
              {selectedSeries?.siteUrl
                && (
                  <IconButton
                    className={classes.iconButton}
                    aria-label="Go to series metadata page in new tab"
                    onClick={goToMatch}
                    onKeyDown={(e) => {
                      if (e?.code === 'Space' || e?.code === 'Enter') {
                        goToMatch();
                      }
                    }}
                  >
                    <OpenInNewIcon className={classes.OpenInNewIcon} />
                  </IconButton>
                )}
            </div>

            <Row>
              {selectedSeries.coverImage
                && (
                  <Col xs={6}>
                    <img
                      style={{ maxWidth: 220 }}
                      src={selectedSeries?.coverImage?.common
                        || selectedSeries?.coverImage?.medium
                        || selectedSeries?.coverImage?.large
                        || selectedSeries?.coverImage?.extraLarge}
                      alt={selectedSeries?.title?.english
                        || selectedSeries?.title?.romaji
                        || selectedSeries?.title?.native}
                    />
                  </Col>
                )}
              <Col xs={6} style={{ wordBreak: 'break-word' }}>

                <div>
                  {selectedSeries.title
                    && (
                      <>
                        <h3>Title</h3>
                        {selectedSeries.title?.english && (
                          <p>
                            English:
                            {selectedSeries.title?.english}
                          </p>
                        )}
                        {selectedSeries.title?.romaji && (
                          <p>
                            Romaji:
                            {selectedSeries.title?.romaji}
                          </p>
                        )}
                        {selectedSeries.title?.native && (
                          <p>
                            Native:
                            {selectedSeries.title?.native}
                          </p>
                        )}
                        {selectedSeries.title?.chinese && (
                          <p>
                            Chinese:
                            {selectedSeries.title?.chinese}
                          </p>
                        )}
                      </>
                    )}
                  {!!hasAltTitles && (
                    <List
                      dense
                      style={{
                        maxHeight: 128,
                        overflow: 'auto',
                        backgroundColor: '#424242',
                      }}
                      subheader={(
                        <ListSubheader
                          disableGutters
                          style={{
                            top: -1,
                          }}
                        >
                          Alternative Titles
                        </ListSubheader>
                      )}
                    >
                      {(selectedSeries.alternativeTitles || []).map((title) => (
                        <ListItem disableGutters>
                          <ListItemText primary={`${title?.label}: ${title?.title}`} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                  {!hasAltTitles
                    && selectedSeries.synonyms && selectedSeries.synonyms?.length > 0 && (
                    <>
                      <p>
                        Synonyms:&nbsp;
                        {selectedSeries.synonyms?.map((synonym, index) => (
                          <span>
                            {synonym}
                            {index < synonymLength - 1 && ','}
                          </span>
                        ))}
                      </p>
                    </>
                  )}
                </div>

                {selectedSeries.description
                  && (
                    <div style={{ marginTop: 24 }}>
                      <h3>Description</h3>
                      <p style={{
                        width: 205,
                        height: 160,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 8,
                      }}
                      >
                        {getText(selectedSeries.description)}
                      </p>
                    </div>
                  )}
              </Col>
            </Row>
          </Col>
        )}

      {searchResults && searchResults.length > 0
        && (
          <Col xs={4} className={classes.matchesList}>
            <h2>Other Matches:</h2>
            <ul>
              {searchResults.map((match) => (
                <li>
                  <a
                    role="button"
                    tabIndex="0"
                    style={{
                      'text-decoration': match.id === selectedSeries.id ? 'underline' : '',
                      fontWeight: match.id === selectedSeries.id ? 700 : 'normal',
                      cursor: 'pointer',
                    }}
                    onClick={() => { updateMatch(match); }}
                    onKeyDown={(e) => {
                      if (e?.code === 'Space' || e?.code === 'Enter') {
                        updateMatch(match);
                      }
                    }}
                  >
                    {
                      match.title.english
                      || match.title.romaji
                      || match.title.native
                      || match?.synonyms?.[0]
                    }
                  </a>
                </li>
              ))}
            </ul>
          </Col>
        )}
    </Row>
  );
};

export default Match;
