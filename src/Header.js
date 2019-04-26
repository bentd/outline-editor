// VENDOR
import $ from "jquery";
import React, { Component } from "react";
import uuidv1 from "uuid/v1";

// APP
import * as Actions from "./Actions.js";


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

  onKeyUp(e) {
    this.props.store.dispatch(Actions.editBullet(this.props.address, this.content.current.innerText)); // edit bullet's content in redux store
  }

  onNoteKeyDown(e) {
    switch(e.keyCode) {
      case 9: // tab
        e.preventDefault();
        break;
      default:
        break;
    }
  }

  onNoteKeyUp(e) {
    this.props.store.dispatch(Actions.editBulletNote(this.props.address, this.note.current.innerText));
  }

  componentDidMount() {
    this.setState({
      content: this.props.focusedBullet.content,
      note: this.props.focusedBullet.note,
      id: this.props.focusedBullet.id,
      address: this.props.focused
    });
  }

  render() {
    return (this.props.focusedBullet.content == null) ? null : (
      <div className="w-100 h-100 pl-3">
        <div className="header-content display-5"
             id="root-bullet-content"
             contentEditable="true"
             suppressContentEditableWarning="true"
             ref={ this.content }
             style={{
               wordWrap: "break-word",
               fontSize: "2.5rem",
               outline: "0px solid transparent",
               minHeight: "2.5rem"
             }}
             onKeyDown={ this.onKeyDown.bind(this) }
             onKeyUp={ this.onKeyUp.bind(this) }>
          { this.state.content }
        </div>
        <div className="header-note lead"
             id="root-bullet-note"
             contentEditable="true"
             suppressContentEditableWarning="true"
             ref={ this.note }
             style={{
               fontSize: "1.5rem",
               outline: "0px solid transparent",
               minHeight: "1.5rem"
             }}
             onKeyDown={ this.onNoteKeyDown.bind(this) }
             onKeyUp={ this.onNoteKeyUp.bind(this) }>
          { this.state.note }
        </div>
      </div>
    )
  }

}

export default Header;
