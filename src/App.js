// VENDOR
import React, { Component } from "react";
import { createStore } from "redux";
import ComponentManager from "sn-components-api";
import yaml from "yaml-js";

// APP
import * as Actions from "./Actions.js";
import "./App.css";
import Navbar from "./Navbar.js";
import Header from "./Header.js";
import Body from "./Body.js";
import Reducer from "./Reducer.js";

class App extends Component {

  constructor(props) {
    super(props);
    this.key = 1;
    this.child = Actions.createNode();
    this.root = Actions.createRoot();
    this.root.children.push(this.child);
    let root = this.root;
    this.state = { root };
    this.initializeStore();

  }

  initializeStore() {
    this.store = createStore(Reducer, this.state);
  }

  initializeStoreCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.unsubscribe = this.store.subscribe(() => {
      this.setState(this.store.getState());
      if (this.note) {
        let note = this.note;
        let noteContent = yaml.dump(this.state.root);
        this.componentManager.saveItemWithPresave(note, () => {
          note.content.text = noteContent;
          note.content.preview_plain = "---";
          note.content.preview_html = null;
        });
      }
    });
  }

  initializeTree(item) {
    this.note = item;
    let noteContent = yaml.load(item.content.text);
    if (typeof noteContent === "string") {
      this.store.dispatch(Actions.editBullet([this.root.id, this.child.id], noteContent));
      this.key += 1;
      this.forceUpdate();
    }
    else if (noteContent === null) {
      this.store.dispatch(Actions.updateRoot(this.state.root));
      return;
    }
    else {
      if (Actions.isCorrectFormat(noteContent)) {
        this.store.dispatch(Actions.updateRoot(noteContent));
      }
      else {
        this.store.dispatch(Actions.updateRoot(this.state.root));
      }
    }
  }

  noteChange(item) {
    if (!this.note) {
      this.initializeTree(item);
      return;
    }
    else if (this.note.uuid !== item.uuid) {
      this.initializeStore();
      this.initializeStoreCallback();
      this.initializeTree(item);
      return;
    }
    else {
      this.note = item;
      return;
    }
  }

  componentDidMount() {
    let permissions = [{ name: "stream-context-item" }];
    this.componentManager = new ComponentManager(permissions, () => {});
    this.componentManager.streamContextItem(this.noteChange.bind(this));
    this.initializeStoreCallback();
  }

  render() {
    const { root } = this.state;
    const { focused } = this.state.root;
    console.log("app.js render", focused, root);
    const focusedBullet = Actions.getNode(focused.slice(), root);
    const focusedTree = Actions.getTree(focused.slice(), root);
    const className = "p-4 w-100 h-100";
    const style = { overflowX: "visible", whiteSpace: "wrap" }
    return (
      <div key={ this.key } id="bullet-editor" className={ className } style={ style }>
        <Navbar store={ this.store } focusedTree={ focusedTree } focused={ focused }></Navbar>
        <Header focusedBullet={ focusedBullet }></Header>
        <Body focusedBullet={ focusedBullet } focused={ focused } store={ this.store }></Body>
      </div>
    );
  }
}

export default App;
