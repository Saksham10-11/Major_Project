import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';

// project import
import MainCard from 'components/MainCard';
import { PromptDialog } from 'components/FormBuilder';

// reducers
import { updateData, setDescription, setTitle } from 'app/slices/FormSlice';

//API's
import { GenerateJSON, saveData } from 'api/FormBuilder';

export default function Breadcrumbs({ navigation, title, ...others }) {
  const location = useLocation();
  const [main, setMain] = useState();
  const [item, setItem] = useState();
  const data = useSelector((state) => state.form.data);
  const formTitle = useSelector((state) => state.form.title);
  const formDescription = useSelector((state) => state.form.description);
  const [isDataEmpty, setIsDataEmpty] = useState(data.length === 0);

  useEffect(() => {
    setIsDataEmpty(data.length === 0);
  }, [data]);

  // set active item state
  const getCollapse = (menu) => {
    if (menu.children) {
      menu.children.filter((collapse) => {
        if (collapse.type && collapse.type === 'collapse') {
          getCollapse(collapse);
        } else if (collapse.type && collapse.type === 'item') {
          if (location.pathname === collapse.url) {
            setMain(menu);
            setItem(collapse);
          }
        }
        return false;
      });
    }
  };

  // State variables for dialog
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [submit, setSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Handle Button clicks
  const handleSave = () => {
    const formData = {
      title: formTitle,
      description: formDescription,
      data: data
    };
    saveData(formData);
    dispatch(updateData([]));
    dispatch(setTitle('Untitled Form'));
    dispatch(setDescription(''));
  };

  const handleGenerate = () => {
    setOpen(true);
  };

  useEffect(() => {
    const generateFormJSON = async () => {
      if (submit) {
        setPrompt('Please wait while your form is being generated ...');
        setLoading(true);
        const FormJSON = await GenerateJSON(prompt);
        dispatch(updateData(FormJSON.data));
        dispatch(setTitle(FormJSON.title));
        dispatch(setDescription(FormJSON.description));
        setPrompt('');
        setLoading(false);
        setOpen(false);
        setSubmit(false);
      }
    };
    generateFormJSON();
  }, [submit]);

  useEffect(() => {
    navigation?.items?.map((menu) => {
      if (menu.type && menu.type === 'group') {
        getCollapse(menu);
      }
      return false;
    });
  });

  // only used for component demo breadcrumbs
  if (location.pathname === '/breadcrumbs') {
    location.pathname = '/dashboard/analytics';
  }

  let mainContent;
  let itemContent;
  let breadcrumbContent = <Typography />;
  let itemTitle = '';

  // collapse item
  if (main && main.type === 'collapse') {
    mainContent = (
      <Typography component={Link} to={document.location.pathname} variant="h6" sx={{ textDecoration: 'none' }} color="textSecondary">
        {main.title}
      </Typography>
    );
  }

  // items
  if (item && item.type === 'item') {
    itemTitle = item.title;
    itemContent = (
      <Typography variant="subtitle1" color="textPrimary">
        {itemTitle}
      </Typography>
    );

    const SaveButton = () => (
      <Button variant="contained" color="primary" onClick={handleSave}>
        Save
      </Button>
    );

    const GenerateButton = () => (
      <Button variant="contained" color="primary" onClick={handleGenerate}>
        Generate using AI
      </Button>
    );

    // main
    if (item.breadcrumbs !== false) {
      breadcrumbContent = (
        <MainCard border={false} sx={{ mb: 3, bgcolor: 'transparent' }} {...others} content={false}>
          <PromptDialog
            open={open}
            setOpen={setOpen}
            prompt={prompt}
            setPrompt={setPrompt}
            setSubmit={setSubmit}
            loading={loading}
          ></PromptDialog>
          <Grid container direction="column" justifyContent="flex-start" alignItems="flex-start" spacing={1}>
            <Grid item>
              <MuiBreadcrumbs aria-label="breadcrumb">
                <Typography component={Link} to="/" color="textSecondary" variant="h6" sx={{ textDecoration: 'none' }}>
                  Home
                </Typography>
                {mainContent}
                {itemContent}
              </MuiBreadcrumbs>
            </Grid>
            {title && (
              <Grid item sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '91%' }}>
                <Typography variant="h5">{item.title}</Typography>
                {item.title === 'Form Builder' && (!isDataEmpty ? <SaveButton /> : <GenerateButton />)}
              </Grid>
            )}
          </Grid>
        </MainCard>
      );
    }
  }
  return breadcrumbContent;
}

Breadcrumbs.propTypes = {
  card: PropTypes.bool,
  custom: PropTypes.bool,
  divider: PropTypes.bool,
  heading: PropTypes.string,
  icon: PropTypes.bool,
  icons: PropTypes.bool,
  links: PropTypes.array,
  maxItems: PropTypes.number,
  rightAlign: PropTypes.bool,
  separator: PropTypes.any,
  title: PropTypes.bool,
  titleBottom: PropTypes.bool,
  sx: PropTypes.any,
  others: PropTypes.any
};
