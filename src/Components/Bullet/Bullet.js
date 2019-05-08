// VENDOR
import $ from "jquery";
import React, { Component } from "react";
import { Collapse } from "react-bootstrap";
import uuidv1 from "uuid/v1";

// APP
import "./Bullet.css";
import * as Actions from "../../Actions/Actions.js";
import { KEY_BACKSPACE, KEY_TAB, KEY_ENTER, KEY_UP, KEY_DOWN, KEY_U, CLOSING_U_TAG_LENGTH, OPENING_U_TAG_LENGTH } from "../../Constants/Constants.js";


class Bullet extends Component {

  constructor(props) {
    super(props);

    // these refs are used to get the value of each bullets content and note
    // values which are used to update the redux store
    this.content = React.createRef();
    this.note = React.createRef();

    this.state = {
      // contains the bullet's content, note, completed bool, and collapsed bool data along with its address (an array of the identifiers of it and its parents) all of which can be seen in plain view
      ...this.props.self,
      // when the user hovers over a bullet with children, the expand icon will appear
      expandVisible: false,
      // the note properties alter the ui as to determine whether a bullet's note div is shown
      noteEmpty: (this.props.self.note === ""),
      noteActive: false,
      // this property determines if a backspace should delete the bullet, after each keystroke the deletable property updates
      deletable: (this.props.self.note === "" && this.props.self.content === ""),
      // the following 6 properties determine if a border is to be shown if a user is dragging a bullet as a sibling or child relative to another
      siblingAbove: false,
      siblingBorder: false,
      siblingCSS: "",
      childBorder: false,
      childAbove: false,
      childCSS: "",
      // is the bullet being dragged?
      beingDragged: false
    };
  }

  onMouseEnter(e) {
    e.stopPropagation();
    this.setState({ expandVisible: true });
  }

  onMouseLeave(e) {
    e.stopPropagation();
    this.setState({ expandVisible: false });
  }

  onKeyDown(e) {
    switch (e.keyCode) {
      case KEY_TAB:
        if (e.shiftKey) { // unindent
          this.props.store.dispatch(Actions.unindentBullet(this.props.address));
          e.preventDefault();
          break;
        }
        else { // indent
          this.props.store.dispatch(Actions.indentBullet(this.props.address));
          e.preventDefault();
          break;
        }
      case KEY_ENTER:
        e.preventDefault();
        if (e.shiftKey) { // shift + enter > activate bullet note for editing
          this.setState({ noteActive: true, noteEmpty: false, noteDeletable: false });
          Actions.focusNodeNote({ id: this.state.id });
          break;
        }
        else { // enter > add a bullet as a new child or as a new sibling
          if (!this.state.collapsed && (this.state.children.length > 0)) {
            this.props.store.dispatch(Actions.addSubBullet(this.props.address));
            break;
          }
          else {
            this.props.store.dispatch(Actions.addBullet(this.props.address));
            break;
          }
        }
      case KEY_UP:
      case KEY_DOWN:
        e.preventDefault(); // prevents cursor from moving to the beginning of the current bullet before moving up or down to the next bullet
        break;
      case KEY_U:
        console.log();
        console.log("pressed u");
        console.log(e.nativeEvent);
        if (e.nativeEvent.metaKey) {
          e.preventDefault();
          let selection = window.getSelection();
          let text = selection.toString();
          console.log(text);
          let html = this.content.current.innerHTML;
          let textIndex = html.indexOf(text);
          console.log(html);
          let newHTML;
          if (html.slice((textIndex - OPENING_U_TAG_LENGTH), textIndex) === "<u>" &&
              html.slice((textIndex + text.length), (textIndex + text.length + CLOSING_U_TAG_LENGTH)) === "</u>") {
            newHTML = html.replace(`<u>${ text }</u>`, text);
          }
          else {
            newHTML = html.replace(text, `<u>${ text }</u>`);
          }
          console.log(newHTML);
          this.props.store.dispatch(Actions.editBullet(this.props.address, newHTML));
          this.setState({ content: newHTML });
          break;
        }
      default:
        if (["\n", ""].indexOf(this.content.current.innerHTML) !== -1 && this.state.children.length === 0) {
          this.setState({ deletable: true }); // can the bullet be deleted?
        }
        break;
    }
  }

  onKeyUp(e) {

    switch (e.keyCode) {
      case KEY_BACKSPACE:
        if (this.state.deletable) { // delete bullet
          this.props.store.dispatch(Actions.deleteBullet(this.props.address));
          e.preventDefault();
          break;
        }
        this.props.store.dispatch(Actions.editBullet(this.props.address, this.content.current.innerHTML)); // edit bullet's content in redux store
        this.setState({ deletable: false });
        break;
      case KEY_UP: // go up a bullet
        e.preventDefault();
        this.props.store.dispatch(Actions.goUp(this.props.address));
        break;
      case KEY_DOWN: // key down > go down a bullet
        e.preventDefault();
        this.props.store.dispatch(Actions.goDown(this.props.address));
        break;
      case KEY_U:
        if (e.nativeEvent.metaKey) {
          break;
        }
      default:
        this.props.store.dispatch(Actions.editBullet(this.props.address, this.content.current.innerHTML)); // edit bullet's content in redux store
        this.setState({ deletable: false });
        break;
    }
  }

  onNoteKeyDown(e) {
    switch(e.keyCode) {
      case KEY_TAB:
        e.preventDefault();
        break;
      default:
        if (this.note.current.innerText === "" && this.state.children.length === 0) {
          this.setState({ noteDeletable: true });
        }
        break;
    }
  }

  onNoteKeyUp(e) {
    switch(e.keyCode) {
      case KEY_BACKSPACE:
        if (this.state.noteDeletable) { // make note disappear not necessarily delete
          this.setState({ noteEmpty: true, noteActive: false });
          this.props.store.dispatch(Actions.editBulletNote(this.props.address, ""));
          Actions.focusNode({ id: this.state.id });
          e.preventDefault();
          break;
        }
        this.setState({ noteEmpty: (this.note.current.innerText === "") });
        break;
      case KEY_UP:
        e.preventDefault();
        Actions.focusNode({ id: this.state.id });
        break;
      case KEY_DOWN:
        e.preventDefault();
        this.props.store.dispatch(Actions.goDown(this.props.address));
        break;
      default:
        this.props.store.dispatch(Actions.editBulletNote(this.props.address, this.note.current.innerText));
        this.setState({ noteDeletable: false, noteActive: true });
    }
  }

  onNoteFocus(e) {
    e.preventDefault();
    e.stopPropagation();
    Actions.focusNodeNote({ id: this.state.id }); // move cursor to note div
  }

  onNoteBlur(e) {
    if (this.note.current.innerText === "" && this.state.children.length === 0) { // hide note div completely if empty
      this.setState({ noteEmpty: true, noteActive: false });
      this.props.store.dispatch(Actions.editBulletNote(this.props.address, ""));
      Actions.focusNode({ id: this.state.id });
    }
  }

  siblingBorder(siblingBorder, e) {
    if (siblingBorder) {
      let bullet = $(`#${this.state.id}`).find(".content-column-icons");
      let height = bullet.height();
      let { top } = bullet.offset();
      let siblingAbove = (e.clientY < (top + height * 0.5));

      if (siblingAbove) {
        this.setState({ siblingCSS: "border-top", siblingAbove });
      }
      else {
        this.setState({ siblingCSS: "border-bottom", siblingAbove });
      }
    }
    else {
      this.setState({ siblingCSS: "" });
    }
  }


  childBorder(childBorder, e) {
    if (childBorder && !(this.state.siblingCSS)) { // sibling border supercedes child border
      this.setState({ childCSS: "border-bottom" });
    }
    else {
      this.setState({ childCSS: "" });
    }
  }


  onDragStart(e) {
    e.dataTransfer.setData("Text", this.props.address.toString()); // transfers the dragged bullets address as a string
    this.setState({ beingDragged: true });
    this.siblingBorder(false, e);
  }

  onDragEnd(e) {
    this.setState({ beingDragged: false });
    this.siblingBorder(false, e);
  }

  onDragSiblingEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.beingDragged) {
      this.siblingBorder(false, e);
      return;
    }
   this.siblingBorder(true, e);
  }

  onDragSiblingOver(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.beingDragged) {
      this.siblingBorder(false, e);
      return;
    }
    this.siblingBorder(true, e);
  }

  onDragSiblingLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.siblingBorder(false, e);
  }

  onDragChildEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.beingDragged) {
      this.childBorder(false, e);
      return;
    }
    if (!this.state.collapsed) { // if uncollapsed only allow drops among sub bullet siblings
      return;
    }
    this.setState({ childBorder: true });
    this.childBorder(true, e);
  }

  onDragChildOver(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.beingDragged) {
      this.childBorder(false, e);
      return;
    }
    if (!this.state.collapsed) { // if uncollapsed only allow drops among sub bullet siblings
      return;
    }
    this.setState({ childBorder: true });
    this.childBorder(true, e);
  }

  onDragChildLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ childBorder: false });
    this.childBorder(false, e);
  }

  onDropChild(e) { // if the bullet is dragged into another bullets content as opposed to the entirety of the bullets area, it is dropped as a child
    e.preventDefault();
    e.stopPropagation();
    if (!this.state.siblingBorder) {
      let childAddress = e.dataTransfer.getData("Text").split(",");
      let newParentAddress = this.props.address;
      if (Actions.sameArray(childAddress, newParentAddress)) {
        return;
      }
      this.props.store.dispatch(Actions.moveBulletAsChild(childAddress, newParentAddress));
      this.setState({ childBorder: false, siblingBorder: false, collapsed: false });
      this.siblingBorder(false, e);
      this.childBorder(false, e);
    }
  }

  onDropSibling(e) { // if the bullet is dragged into the entirety of a bullets area as opposed to the bullets content, it is dropped as a sibling
    e.preventDefault();
    e.stopPropagation();
    if (this.state.siblingCSS || !this.state.childCSS) {
      let childAddress = e.dataTransfer.getData("Text").split(",");
      let newSiblingAddress = this.props.address;
      if (Actions.sameArray(childAddress, newSiblingAddress)) {
        return;
      }
      this.props.store.dispatch(Actions.moveBulletAsSibling(childAddress, newSiblingAddress, this.state.siblingAbove));
      this.siblingBorder(false, e);
      this.childBorder(false, e);
    }
  }

  toggleCollapse(e, uncollapse=null) { // are the bullets children shown?
    this.props.store.dispatch(Actions.toggleCollapse(this.props.address)); // toggles collapse that persists when note is changed/closed
    this.setState({ collapsed: !this.state.collapsed }); // toggles collapse in real-time
  }

  setFocused(e) { // the bullet is zoomed in on
    this.props.store.dispatch(Actions.updateFocused(this.props.address));
  }

  componentDidMount() {
    this.numChildren = this.state.children.length;
  }

  componentWillUpdate() {
    if (this.state.children.length === (this.numChildren + 1)) {
      this.props.store.dispatch(Actions.unCollapse(this.props.address)); //  uncollapses bullet that persists when note is changed/closed
      this.setState({ collapsed: false }); // toggles collapse in real-time
      this.numChildren = this.state.children.length;
    }
  }

  render() {
    const state = this.props.store.getState();
    const mobile = state.mobile;
    const hasChildren = (this.state.children.length > 0);
    return (
      <div className={ "bullet container-fluid w-100 p-0 m-0 " + this.state.siblingCSS }
           id={ this.state.id }
           onDrop={ this.onDropSibling.bind(this) }
           onDragEnter={ this.onDragSiblingEnter.bind(this) }
           onDragOver={ this.onDragSiblingOver.bind(this) }
           onDragLeave={ this.onDragSiblingLeave.bind(this) }>
        <div className="content-row d-flex flex-row w-100" onMouseEnter={ this.onMouseEnter.bind(this) } onMouseLeave={ this.onMouseLeave.bind(this) }>
          <div className="content-column-icons align-self-start position-relative">
            { mobile &&
              <div className="expand-icon-container position-absolute">
                { this.state.children.length > 0 &&
                  <button className="expand border-0"
                          onClick={ this.toggleCollapse.bind(this) }>
                    <svg height="12px"
                         width="12px"
                         viewBox="0 0 100 100">
                      { this.state.children.length > 0 && this.state.collapsed &&
                          <polygon points="0,0 0,100 100,50" fill="dimgrey"/>
                      }
                      { this.state.children.length > 0 && !(this.state.collapsed) &&
                          <polygon points="0,0 50,100 100,0" fill="dimgrey"/>
                      }
                    </svg>
                  </button>
                }
              </div>
            }
            { !mobile &&
            <div className="expand-icon-container position-absolute">
              { this.state.children.length > 0 &&
                <button className="expand-icon border-0"
                        onClick={ this.toggleCollapse.bind(this) }>
                  <svg height="12px"
                       width="12px"
                       viewBox="0 0 100 100">
                    { this.state.children.length > 0 && this.state.expandVisible && this.state.collapsed &&
                        <polygon points="0,0 0,100 100,50" fill="dimgrey"/>
                    }
                    { this.state.children.length > 0 && this.state.expandVisible && !(this.state.collapsed) &&
                        <polygon points="0,0 50,100 100,0" fill="dimgrey"/>
                    }
                  </svg>
                </button>
              }
            </div>
          }
            <div className="bullet-icon-container p-1"
                 draggable={ true }
                 onDragStart={ this.onDragStart.bind(this) }
                 onDragEnd={ this.onDragEnd.bind(this) }>
              <button className="bullet-icon border-0"
                      onClick={ this.setFocused.bind(this) }>
                <svg height="35px"
                     width="35px"
                     viewBox="0 0 100 100">
                  <circle cx="50%"
                          cy="50%"
                          r={ hasChildren ? "25" : "12.5" }
                          stroke="lightgrey"
                          strokeWidth={ hasChildren ? "25" : "0" }
                          fill="dimgrey" />
                </svg>
              </button>
            </div>
          </div>
          <div className={ "content-column-text flex-grow-1 align-self-start h-100 pt-2 position-relative " + (this.state.noteEmpty ? this.state.childCSS : "") }
               onDragEnter={ this.onDragChildEnter.bind(this) }
               onDragOver={ this.onDragChildOver.bind(this) }
               onDragLeave={ this.onDragChildLeave.bind(this) }
               onDrop={ this.onDropChild.bind(this) }>
            <div className={ "content " + (this.state.noteEmpty ? "w-100" : "") }
                 contentEditable="true"
                 suppressContentEditableWarning="true"
                 ref={ this.content }
                 onKeyDown={ this.onKeyDown.bind(this) }
                 onKeyUp={ this.onKeyUp.bind(this) }
                 dangerouslySetInnerHTML={{ __html: this.state.content }}>
            </div>
          </div>
        </div>
        <div className={ this.state.noteEmpty ? "note-empty" : "note-row d-flex flex-row pl-2 w-100" }>
          <div className="note-column flex-grow-1 align-self-center pl-5 w-100">
            <div className={ "note w-75 pb-2 " + this.state.childCSS + " " + (this.state.noteActive ? "note-active" : "note-collapsed") }
                 contentEditable="true"
                 suppressContentEditableWarning="true"
                 ref={ this.note }
                 onFocus={ this.onNoteFocus.bind(this) }
                 onBlur={ this.onNoteBlur.bind(this) }
                 onKeyDown={ this.onNoteKeyDown.bind(this) }
                 onKeyUp={ this.onNoteKeyUp.bind(this) }
                 onDragEnter={ this.onDragChildEnter.bind(this) }
                 onDragOver={ this.onDragChildOver.bind(this) }
                 onDragLeave={ this.onDragChildLeave.bind(this) }
                 onDrop={ this.onDropChild.bind(this) }>
              { this.state.note }
            </div>
          </div>
        </div>
        <div className="children-row d-flex flex-row">
          <div className="children-column flex-grow-1 align-self-center border-0 pl-4">
            <Collapse in={ !(this.state.collapsed) } timeout={10}>
              <div className="children border-left pl-3">
                { this.state.children.length > 0 &&
                    this.state.children.map((child, index) =>
                <Bullet key={ child.id }
                        address={ [...this.props.address, child.id] }
                        store={ this.props.store }
                        self={ child }>
                </Bullet>
                )}
              </div>
            </Collapse>
          </div>
        </div>
      </div>
    );
  }

}

export default Bullet;
