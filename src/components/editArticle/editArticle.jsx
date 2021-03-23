import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Redirect, withRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { loadArticles, getArticle, loadArticle } from '../../action/action';
import Api from '../../api/api';
import TagsForm from '../tagsForm/tagsForm';
import './editArticle.scss';

const EditArticle = ({ history, slug }) => {
  const dispatch = useDispatch();
  const articleLoad = useSelector((state) => state.articleLoad);
  const userState = useSelector((state) => state.user);
  const article = useSelector((state) => state.article);
  const loginUser = useSelector((state) => state.loginUser);
  const [articleAdd, setArticleAdd] = useState(false);
  const [tagsEdit, setTagsEdit] = useState('');
  const { register, handleSubmit, errors, setValue } = useForm();

  const setValueForm = () => {
    setValue('title', article.title);
    setValue('shortdescription', article.body);
    setValue('text', article.description);
    setTagsEdit(new Set([...article.tagList]));
  };

  useEffect(() => {
    if (!articleLoad) {
      Api.getArticle(slug, userState.token)
        .then((result) => {
          dispatch(getArticle(result.article));
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(`Error ${error}`);
        });
    } else {
      setValueForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleLoad]);

  const onSubmit = (article) => {
    const userPush = {
      article: {
        title: article.title,
        description: article.shortdescription,
        body: article.text,
        tagList: [...tagsEdit],
      },
    };

    Api.updateArticle('/articles', userPush, userState.token, slug).then(() => {
      setArticleAdd(true);
      dispatch(loadArticles());
      dispatch(loadArticle());
      history.push(`/`);
    });
  };

  if (!loginUser) {
     return <Redirect to='/' />
  }

  return (
    <div className="edit-container">
      <form className={clsx(articleAdd && 'edit-form-in-true', 'edit-form')} onSubmit={handleSubmit(onSubmit)}>
        <h1>Edite article</h1>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          placeholder="Title"
          className={clsx(errors.title?.type === 'required' && 'edit-errors__input')}
          name="title"
          ref={register({ required: true })}
        />
        {errors.title?.type === 'required' && <p>*The field cannot be empty</p>}
        <label htmlFor="shortdescription">Short description</label>
        <input
          id="shortdescription"
          placeholder="Short description"
          className={clsx(errors.shortdescription?.type === 'required' && 'edit-errors__input')}
          name="shortdescription"
          ref={register({ required: true })}
        />
        {errors.shortdescription?.type === 'required' && <p>*The field cannot be empty</p>}
        <label htmlFor="text">Text</label>
        <textarea
          id="text"
          type="text"
          placeholder="Text"
          className={clsx(errors.text?.type === 'required' && 'edit-errors__input')}
          name="text"
          ref={register({ required: true })}
        />
        {errors.text?.type === 'required' && <p>*The field cannot be empty</p>}
        <TagsForm tags={tagsEdit} setTags={setTagsEdit} />
        <input type="submit" value="Send" />
      </form>
    </div>
  );
};

EditArticle.defaultProps = {
  slug: 'test',
  history: {},
};

EditArticle.propTypes = {
  slug: PropTypes.string,
  history: PropTypes.objectOf,
};

export default withRouter(EditArticle);
