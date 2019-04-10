import React, { Component } from "react";
import { Collapse } from "react-bootstrap";
import "./Bullet.css";
import * as Actions from "./Actions.js";
import $ from "jquery";
import uuidv1 from "uuid/v1";

class Bullet extends Component {

  constructor(props) {
    super(props);

    this.content = React.createRef();
    this.note = React.createRef();

    this.state = {
      ...this.props.self,
      expandVisible: false,
      noteEmpty: (this.props.self.note === ""),
      noteActive: false,
      deletable: (this.props.self.note === "" && this.props.self.content === ""),
      siblingAbove: false,
      siblingBorder: false,
      siblingCSS: "",
      childBorder: false,
      childAbove: false,
      childCSS: "",
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
    console.log("onkeydown main", this.state.content);
    switch (e.keyCode) {
      case 9: // tab
        if (e.shiftKey) { // shift + tab
          this.props.store.dispatch(Actions.unindentBullet([0, ...this.props.position]));
          e.preventDefault();
          break;
        }
        else { // tab
          this.props.store.dispatch(Actions.indentBullet([0, ...this.props.position]));
          e.preventDefault();
          break;
        }
      case 13: // enter
        if (e.shiftKey) {
          this.setState({ noteActive: true, noteEmpty: false, noteDeletable: false });
          console.log("onkeydown shift", this.state.content);
          Actions.focusNodeNote({ id: this.state.id });
          e.preventDefault();
          break;
        }
        else {
          if (!this.state.collapsed && (this.state.children.length > 0)) {
            let newUUID = uuidv1();
            this.props.store.dispatch(Actions.addBullet([0, ...this.props.position, -1], newUUID));
            e.preventDefault();
            break;
          }
          else {
            let newUUID = uuidv1();
            this.props.store.dispatch(Actions.addBullet([0, ...this.props.position], newUUID));
            e.preventDefault();
            break;
          }
        }
      case 38: // key up
        e.preventDefault();
        break;
      default:
        if (this.content.current.innerText === "" && this.state.children.length === 0) {
          this.setState({ deletable: true });
        }
        break;
    }
  }

  onKeyUp(e) {
    switch (e.keyCode) {
      case 8: // backspace
        if (this.state.deletable) {
          this.props.store.dispatch(Actions.deleteBullet([0, ...this.props.position]));
          e.preventDefault();
          break;
        }
        break;
      case 13:
          console.log("onkeyup", this.state.content);
          break;
      case 37: // key left
      break;
      case 38: // key up
        e.preventDefault();
        this.props.store.dispatch(Actions.goUp([0, ...this.props.position]));
        break;
      case 39: // key right
        break;
      case 40: // key down
        e.preventDefault();
        this.props.store.dispatch(Actions.goDown([0, ...this.props.position]));
        break;
      default:
        this.props.store.dispatch(Actions.editBullet([0, ...this.props.position], this.content.current.innerText));
        this.setState({ deletable: false });
        break;
    }
  }



  onNoteKeyDown(e) {
    switch(e.keyCode) {
      case 9: // tab
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
      case 8: // backspace
        if (this.state.noteDeletable) {
          this.setState({ noteEmpty: true, noteActive: false });
          this.props.store.dispatch(Actions.editBulletNote([0, ...this.props.position], ""));
          Actions.focusNode({ id: this.state.id });
          e.preventDefault();
          break;
        }
        this.setState({ noteEmpty: (this.note.current.innerText === "") });
        break;
      case 37: // key left
      case 38: // key up
        e.preventDefault();
        Actions.focusNode({ id: this.state.id });
        break;
      case 39: // key right
      case 40: // key down
        e.preventDefault();
        this.props.store.dispatch(Actions.goDown([0, ...this.props.position]));
        break;
      default:
        this.props.store.dispatch(Actions.editBulletNote([0, ...this.props.position], this.note.current.innerText));
        this.setState({ noteDeletable: false, noteActive: true });
    }
  }

  onNoteFocus(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log(this.state.content);
    Actions.focusNodeNote({ id: this.state.id });
  }

  onNoteBlur(e) {
    if (this.note.current.innerText === "" && this.state.children.length === 0) {
      this.setState({ noteEmpty: true, noteActive: false });
      this.props.store.dispatch(Actions.editBulletNote([0, ...this.props.position], ""));
      Actions.focusNode({ id: this.state.id });
    }
  }

  siblingBorder(siblingBorder, e) {
    if (this.state.childCSS) {
      this.setState({ siblingCSS: "" });
      return;
    }
    if (siblingBorder) {
      let bullet = $(`#${this.state.id}`).find(".content-column-icons");
      let height = bullet.height();
      let { top } = bullet.offset();
      let siblingAbove = (e.clientY < (top + height * 0.5));

      if (siblingAbove) {
        if (!Actions.isRootChild([0, ...this.props.position]) &&
            Actions.isFirstChild([0, ...this.props.position])) {
              return;
        }
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
    if (childBorder) {
      this.setState({ childCSS: "border-bottom" });
    }
    else {
      this.setState({ childCSS: "" });
    }
  }


  onDragStart(e) {
    e.dataTransfer.setData("Text", [0, ...this.props.position].toString());
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
    this.setState({ childBorder: true });
    this.childBorder(true, e);
  }

  onDragChildOver(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ childBorder: true });
    this.childBorder(true, e);
  }

  onDragChildLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ childBorder: false });
    this.childBorder(false, e);
  }

  onDropChild(e) {
    e.preventDefault();
    e.stopPropagation();
    let childPosition = e.dataTransfer.getData("Text").split(",").map(index => parseInt(index));
    let newParentPosition = [0, ...this.props.position];
    if (Actions.sameArray(childPosition, newParentPosition)) {
      return;
    }
    this.props.store.dispatch(Actions.moveBulletAsChild(childPosition, newParentPosition));
    this.setState({ childBorder: false, siblingBorder: false });
    this.siblingBorder(false, e);
    this.childBorder(false, e);
  }

  onDropSibling(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.state.childCSS) {
      let childPosition = e.dataTransfer.getData("Text").split(",").map(index => parseInt(index));
      let newSiblingPosition = [0, ...this.props.position];
      if (Actions.sameArray(childPosition, newSiblingPosition)) {
        return;
      }
      this.props.store.dispatch(Actions.moveBulletAsSibling(childPosition, newSiblingPosition, this.state.siblingAbove));
      this.siblingBorder(false, e);
      this.childBorder(false, e);
    }
  }

  onClick(e) {
    this.props.store.dispatch(Actions.toggleCollapse([0, ...this.props.position])); // toggles collapse that persists when note is changed/closed
    this.setState({ collapsed: !this.state.collapsed }); // toggles collapse in real-time
  }

  setActive(e) {
    this.props.store.dispatch(Actions.updateActive(this.props.position));
  }

  componentDidMount() {
  }

  render() {
    return (
      <div className={ "bullet container-fluid w-100 p-0 m-0 " + this.state.siblingCSS }
           id={ this.state.id }
           onDrop={ this.onDropSibling.bind(this) }
           onDragEnter={ this.onDragSiblingEnter.bind(this) }
           onDragOver={ this.onDragSiblingOver.bind(this) }
           onDragLeave={ this.onDragSiblingLeave.bind(this) }>
        <div className="content-row d-flex flex-row w-100" onMouseEnter={ this.onMouseEnter.bind(this) } onMouseLeave={ this.onMouseLeave.bind(this) }>
          <div className="content-column-icons align-self-center position-relative">
            <div className="expand-icon-container position-absolute"
                 style={{ left: -12, top: 8 }}>
              { this.state.children.length > 0 &&
                <button className="expand border-0"
                        onClick={ this.onClick.bind(this) }
                        style={{ backgroundColor: "transparent" }}>
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
            <div className="bullet-icon-container p-1"
                 draggable={ true }
                 onDragStart={ this.onDragStart.bind(this) }
                 onDragEnd={ this.onDragEnd.bind(this) }>
              <button className="bullet border-0"
                      onClick={ this.setActive.bind(this) }
                      style={{backgroundColor: "transparent", outline: "0px"}}>
                <svg height="35px"
                     width="35px"
                     viewBox="0 0 100 100">
                  <circle cx="50%"
                          cy="50%"
                          r="25"
                          stroke="lightgrey"
                          strokeWidth="25"
                          fill="dimgrey" />
                </svg>
              </button>
            </div>
          </div>
          { this.state.noteEmpty &&
            <div className={ "content-column-text flex-grow-1 align-self-center " + this.state.childCSS }
                 onDragEnter={ this.onDragChildEnter.bind(this) }
                 onDragOver={ this.onDragChildOver.bind(this) }
                 onDragLeave={ this.onDragChildLeave.bind(this) }
                 onDrop={ this.onDropChild.bind(this) }>
              <div className="content w-100"
                   contentEditable="true"
                   suppressContentEditableWarning="true"
                   ref={ this.content }
                   style={{ outline: "0px solid transparent" }}
                   onKeyDown={ this.onKeyDown.bind(this) }
                   onKeyUp={ this.onKeyUp.bind(this) }>
                { this.state.content }
              </div>
            </div>
          }
          { !this.state.noteEmpty &&
            <div className={ "content-column-text flex-grow-1 align-self-center" }
                 onDragEnter={ this.onDragChildEnter.bind(this) }
                 onDragOver={ this.onDragChildOver.bind(this) }
                 onDragLeave={ this.onDragChildLeave.bind(this) }
                 onDrop={ this.onDropChild.bind(this) }>
              <div className="content"
                   contentEditable="true"
                   suppressContentEditableWarning="true"
                   ref={ this.content }
                   style={{ outline: "0px solid transparent" }}
                   onKeyDown={ this.onKeyDown.bind(this) }
                   onKeyUp={ this.onKeyUp.bind(this) }>
                { this.state.content }
              </div>
            </div>
          }
        </div>
        <div className="note-row pl-2 w-100"
             style={{ display: (this.state.noteEmpty ? "none" : "block") }}>
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
                 onDrop={ this.onDropChild.bind(this) }
                 style={{
                   fontSize: "12px",
                   outline: "0px solid transparent"
                 }}>
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
                              position={ [...this.props.position, index] }
                              store={ this.props.store }
                              self={ child }>
                      </Bullet>
                    )
                }
              </div>
            </Collapse>
          </div>
        </div>
      </div>
    );
  }

}

export default Bullet;
