import React, { useEffect, useRef, useState } from 'react';
import "./Note.css";
import { GoPencil } from "react-icons/go";
import { CiCalendar, CiCalendarDate } from "react-icons/ci";
import { TiPinOutline } from "react-icons/ti";
import { Editor } from '@tinymce/tinymce-react';
import { useDispatch, useSelector } from 'react-redux';
import { AddNoteAction, DeleteNoteAction, GetNoteAction, ResetNoteAction, UpdateNoteAction } from '../../../redux/actions/NoteAction';
import { Link, NavLink, useParams } from 'react-router-dom';
import { AiOutlineDelete } from "react-icons/ai";
import parse from 'html-react-parser';
import toast from 'react-hot-toast';

export default function Note() {
  const { theme } = useSelector((state) => state.WebReducer);
  const noteListData = useSelector((state) => state.NoteReducer.noteData);
  const noteTypeData = useSelector(state => state.NoteReducer.noteTypes);
  const noteEditData = useSelector(state => state.NoteReducer.noteEdit);
  const { success } = useSelector((state) => state.NoteReducer);

  const dispatch = useDispatch();
  const editorRef = useRef(null);
  const { id, type } = useParams();
  const [openEditor, setOpenEditor] = useState(false);
  const [editorText, setEditorText] = useState('');
  const [formData, setFormData] = useState({
    note_title: '',
    note_type: ''
  });
  useEffect(() => {
    if (success !== "") {
      toast.success(success);
      dispatch(ResetNoteAction());
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (id) {
      setOpenEditor(true);
      setFormData({
        note_title: noteEditData.note_title || '',
        note_type: noteEditData.note_type || ''
      });
      setEditorText(noteEditData.note_content || '');
    } else {
      resetForm();
    }
  }, [id, noteEditData]);
  const resetForm = () => {
    setFormData({ note_title: '', note_type: '' });
    setEditorText('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const log = () => {
    if (editorRef.current) {
      setEditorText(editorRef.current.getContent());
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const date = new Date().toLocaleString();
    const noteData = {
      ...formData,
      note_content: editorText,
      note_date: date,
      note_id: id ? id : Math.max(...noteListData.map(o => o.note_id), 0) + 1
    };

    if (id) {
      dispatch(UpdateNoteAction(noteData));
    } else {
      dispatch(AddNoteAction(noteData));
    }
  };
  const renderNoteTab = () => (
    <>
      {noteTypeData.map((note, index) => (
        <NavLink to={`/admin/note/type/${note}`} className={({ isActive }) =>
          isActive ? "tab__note active__link" : "tab__note"
        } key={index}>{note}</NavLink>
      ))}

    </>
  );
  const renderNoteList = () => {
    const filteredNotes = noteListData.filter(note => note.note_type === type);
    const notesToRender = type ? filteredNotes : noteListData;
    return notesToRender.map((note, index) => (
      <Link to={`/admin/note/${note.note_id}`} className='note__item' key={index} onClick={() => dispatch(GetNoteAction(note.note_id))}>
        <div className='item__header'>
          <CiCalendar className='note__icon' />
          <div className='note__change'>
            <Link to={`/admin/note/${note.note_id}`} className="button__action" onClick={() => dispatch(GetNoteAction(note.note_id))}>
              <TiPinOutline className='note__pin' />
            </Link>
            <AiOutlineDelete className='note__more' onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${note.note_title}"?`)) {
                dispatch(DeleteNoteAction(note.note_id));
              }
            }} />
          </div>
        </div>
        <div className='item__body'>
          <h3>{note.note_title}</h3>
          <div className='note__text'>{parse(note.note_content)}</div>
        </div>
        <div className='item__footer'>
          <p>{note.note_author}</p>
          <div className='item__date'>
            <CiCalendarDate className='note__date' />
            <span>{note.note_date}</span>
          </div>
        </div>

      </Link>
    ));
  };

  return (
    <div className="note__container">
      <form onSubmit={onSubmit}>
        <div className="note__header">
          <div className="open__note" style={{ display: openEditor ? "none" : "flex" }} onClick={() => setOpenEditor(true)}>
            <GoPencil /> <span>Write your note</span>
          </div>
          <div className="note__input" style={{ display: openEditor ? "flex" : "none" }}>
            <input className="open__note" type="text" placeholder="Title..." name="note_title" value={formData.note_title} onChange={handleChange} required />
            <input list="note-type" name="note_type" className="open__note" placeholder="Type..." value={formData.note_type} onChange={handleChange} required />
          </div>
          <datalist id="note-type">
            {noteTypeData.map((noteType) => (
              <option key={noteType} value={noteType} />
            ))}
          </datalist>
        </div>
        <div className="note__editor" style={{ display: openEditor ? "block" : "none" }}>
          <Editor
            key={theme}
            apiKey="qqcfb0qid0ghvvpl2t7ya6zeljdcmk0imjd2xxnnnawodpnn"
            className="my__editor"
            onInit={(evt, editor) => (editorRef.current = editor)}
            value={editorText}
            init={{
              height: 350,
              menubar: false,
              plugins: [
                "advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor",
                "searchreplace", "visualblocks", "code", "fullscreen", "insertdatetime", "media",
                "table", "help", "wordcount", "codesample"
              ],
              toolbar: "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
              skin: theme === "dark" ? "oxide-dark" : "oxide",
              content_css: theme === "dark" ? "dark" : "default",
            }}
            onEditorChange={log}
          />
          <div className="button__note">
            <button className="post__save" type='button' onClick={() => setOpenEditor(false)}>Close</button>
            <button className="post__save" type="submit">Save</button>
          </div>
        </div>
      </form>
      <div className="note__body">
        <h3>Your Note</h3>
        <div className="note__menu">
          <div className="note__tab">
            <NavLink to={`/admin/note`} end className={({ isActive }) =>
              isActive ? "tab__note active__link" : "tab__note"
            }>All</NavLink>
            {renderNoteTab()}
          </div>
        </div>
        <div className="note__content">{renderNoteList()}</div>
      </div>
    </div>

  );
}