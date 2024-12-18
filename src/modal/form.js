import React from 'react';
import { useDispatch, shallowEqual, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import {
  Checkbox,
  FormControlLabel,
  List, ListItem, ListItemText, ListSubheader, TextField,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import { Row, Col } from 'react-styled-flexboxgrid';

import { selectSelectedSeries, selectExistingMetadata, selectModalStatus } from '../selectors';
import { getDefaultValues } from '../helpers';
import { setFormData, updateMetadata, search } from '../actions';

const MetadataModal = () => {
  const dispatch = useDispatch();

  const modalStatus = useSelector(selectModalStatus, shallowEqual);
  const selectedSeries = useSelector(selectSelectedSeries, shallowEqual);
  const existingMetadata = useSelector(selectExistingMetadata, shallowEqual);
  const defaultValues = getDefaultValues({ existingMetadata, selectedSeries });

  const readOnly = {
    title: existingMetadata.titleLock && window.komga.enforceLocks,
    sortTitle: existingMetadata.titleSortLock && window.komga.enforceLocks,
    summary: existingMetadata.summaryLock && window.komga.enforceLocks,
    status: existingMetadata.statusLock && window.komga.enforceLocks,
    publisher: existingMetadata.publisherLock && window.komga.enforceLocks,
    genres: existingMetadata.genresLock && window.komga.enforceLocks,
    tags: existingMetadata.tagsLock && window.komga.enforceLocks,
    language: existingMetadata.languageLock && window.komga.enforceLocks,
    ageRating: existingMetadata.ageRatingLock && window.komga.enforceLocks,
  };

  const {
    register, control, handleSubmit, errors, reset, getValues,
  } = useForm({ defaultValues });

  React.useEffect(() => {
    dispatch(
      setFormData({
        metadata: {
          reset,
          getValues,
          errors,
          handleSubmit,
        },
      }),
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // console.log(errors);

  const onClickFetchData = () => {
    dispatch(search({ title: getValues('title'), update: true, type: modalStatus.type }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(updateMetadata());
  };

  const textFieldStyle = {
    margin: '12px auto',
    display: 'flex',
  };

  const linksInput = register('links');
  const authorsInput = register('authors');
  const coverInput = register('coverImage');

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input type="hidden" name={coverInput?.name} ref={coverInput?.ref} onChange={coverInput?.onChange} onBlur={coverInput?.onBlur} />
        <FormControlLabel
          label="Replace Cover"
          control={(
            <Controller
              defaultValue
              name="coverToggle"
              control={control}
              render={({ value, onChange }) => (
                <Checkbox
                  checked={!!value}
                  onChange={(e) => onChange(e.target.checked)}
                />
              )}
            />
          )}
        />

        <div style={{ position: 'relative' }}>
          <Controller
            as={TextField}
            name="title"
            label="Title"
            placeholder="Title"
            control={control}
            variant="filled"
            style={textFieldStyle}
            inputProps={{
              readOnly: readOnly.title,
              'data-lpignore': 'true',
            }}
          />
          <IconButton aria-label="search" style={{ position: 'absolute', top: 5, right: 0 }} onClick={onClickFetchData}>
            <SearchIcon />
          </IconButton>
        </div>

        <Controller
          as={TextField}
          name="sortTitle"
          label="Sort Title"
          placeholder="Sort Title"
          control={control}
          variant="filled"
          style={textFieldStyle}
          inputProps={{
            readOnly: readOnly.sortTitle,
          }}
        />

        <Controller
          as={TextField}
          name="summary"
          label="Summary"
          placeholder="Summary"
          control={control}
          variant="filled"
          multiline
          style={textFieldStyle}
          inputProps={{
            readOnly: readOnly.summary,
          }}
        />

        <input type="hidden" name={linksInput?.name} ref={linksInput?.ref} onChange={linksInput?.onChange} onBlur={linksInput?.onBlur} />
        <List
          style={{
            maxHeight: 260,
            overflow: 'auto',
            backgroundColor: '#424242',
          }}
          subheader={
            <ListSubheader style={{ top: -1 }}>Links</ListSubheader>
          }
        >
          {(defaultValues?.links || []).map(
            (link) => (
              <ListItem>
                <ListItemText primary={link.label} secondary={link.url} />
              </ListItem>
            ),
          )}
        </List>

        <input type="hidden" name={authorsInput?.name} ref={authorsInput?.ref} onChange={authorsInput?.onChange} onBlur={authorsInput?.onBlur} />
        <List
          style={{
            maxHeight: 260,
            overflow: 'auto',
            backgroundColor: '#424242',
          }}
          subheader={
            <ListSubheader style={{ top: -1 }}>Authors</ListSubheader>
          }
        >
          {(defaultValues?.authors || []).map(
            (author) => (
              <ListItem>
                <ListItemText primary={author.name} secondary={author.role} />
              </ListItem>
            ),
          )}
        </List>

        <Row>
          <Col xs={6}>
            <Controller
              as={TextField}
              name="status"
              label="Status"
              placeholder="Status"
              control={control}
              variant="filled"
              style={textFieldStyle}
              inputProps={{
                readOnly: readOnly.status,
              }}

            />
          </Col>
          <Col xs={6}>
            <Controller
              as={TextField}
              name="language"
              label="Language"
              placeholder="Language"
              control={control}
              variant="filled"
              style={textFieldStyle}
              inputProps={{
                readOnly: readOnly.language,
              }}

            />
          </Col>
        </Row>
        <Row>
          <Col xs={6}>

            <Controller
              as={TextField}
              name="publisher"
              label="Publisher"
              placeholder="Publisher"
              control={control}
              variant="filled"
              style={textFieldStyle}
              inputProps={{
                readOnly: readOnly.publisher,
              }}

            />
          </Col>
          <Col xs={6}>
            <Controller
              as={TextField}
              name="ageRating"
              label="Age Rating"
              placeholder="Age Rating"
              control={control}
              variant="filled"
              style={textFieldStyle}
              inputProps={{
                readOnly: readOnly.ageRating,
              }}
            />
          </Col>
        </Row>

        <Controller
          as={TextField}
          name="genres"
          label="Genres"
          placeholder="Genres"
          control={control}
          variant="filled"
          style={textFieldStyle}
          inputProps={{
            readOnly: readOnly.genres,
          }}

        />

        <Controller
          as={TextField}
          name="tags"
          label="Tags"
          placeholder="Tags"
          control={control}
          variant="filled"
          style={textFieldStyle}
          inputProps={{
            readOnly: readOnly.tags,
          }}

        />
        <Button style={{ float: 'right' }} type="submit">Save Changes</Button>
      </form>
    </div>
  );
};

export default MetadataModal;
