// VENDOR
import $ from "jquery";
import React, { Component } from "react";

// APP
import "./Header.css";
import * as Actions from "../../Actions/Actions.js";
import { KEY_ENTER, KEY_TAB, KEY_U } from "../../Constants/Constants.js";


class Header extends Component {
  // this shows the title of the current focused bullet along with its note

  constructor(props) {
    super(props);
    this.content = React.createRef();
    this.note = React.createRef();
    this.state = {};
  }

  onKeyDown(e) {
  }

  onKeyDown(e) {
    switch (e.keyCode) {
      case KEY_ENTER:
        e.preventDefault();
        if (e.shiftKey) { // shift + enter > activate note for editing
          this.note.current.focus();
          break;
        }
        else { // enter > add a bullet as a new child
          this.props.store.dispatch(Actions.addSubBullet(this.props.address));
          break;
        }
      case KEY_U:
        if (e.nativeEvent.metaKey) { // cmd + u does not work so it must be polyfilled
          e.preventDefault();
          let selection = window.getSelection();
          let leading = selection.anchorNode;
          let trailing = leading.splitText(selection.focusOffset);
          let selected = leading.splitText(selection.anchorOffset)
          let jNode = $(selected);

          if (selected.parentNode.nodeName !== "U") {
            jNode.wrap("<u></u>");
          }
          else {
            jNode.unwrap();
          }
        }
        break;
      default:
        break;
    }
  }

  onKeyUp(e) {
    switch (e.keyCode) {
      case KEY_ENTER:
        e.preventDefault();
      default:
        this.props.store.dispatch(Actions.editBullet(this.props.address, this.content.current.innerHTML)); // edit bullet's content in redux store
    }
  }

  onNoteKeyDown(e) {
    switch(e.keyCode) {
      case KEY_TAB: // tab
        e.preventDefault();
        break;
      default:
        break;
    }
  }

  onNoteKeyUp(e) {
    this.props.store.dispatch(Actions.editBulletNote(this.props.address, this.note.current.innerHTML));
  }

  componentDidMount() {
    this.setState({
      content: this.props.focusedBullet.content,
      note: this.props.focusedBullet.note,
      id: this.props.focusedBullet.id,
      address: this.props.focused
    });
  }

  componentWillUpdate() {
    if (this.props.focusedBullet.children.length === 0) {
      this.content.current.focus();
    }
  }

  render() {
    return (this.props.focusedBullet.content == null) ? null : (
      <div className="w-100 h-100 pl-3">
        <div className="header-content display-5"
             id="root-bullet-content"
             contentEditable="true"
             suppressContentEditableWarning="true"
             ref={ this.content }
             onKeyDown={ this.onKeyDown.bind(this) }
             onKeyUp={ this.onKeyUp.bind(this) }
             dangerouslySetInnerHTML={{ __html: this.state.content }}>
        </div>
        <div className="header-note lead"
             id="root-bullet-note"
             contentEditable="true"
             suppressContentEditableWarning="true"
             ref={ this.note }
             onKeyDown={ this.onNoteKeyDown.bind(this) }
             onKeyUp={ this.onNoteKeyUp.bind(this) }
             dangerouslySetInnerHTML={{ __html: this.state.note }}>
        </div>
      </div>
    )
  }

}

export default Header;
