import React, { Component } from 'react';
import ComponentManager from 'sn-components-api';
import Bullet from "./Bullet.js";
import "./App.css";
import $ from "jquery";
import uuidv1 from "uuid/v1";
import { createStore } from "redux";
import yaml from "yaml-js";
import Reducer from "./Reducer.js";
import * as Actions from "./Actions.js";

class App extends Component {

  constructor(props) {
    super(props);
    this.mounted = false;
    let child = Actions.createNode();
    let root = [Actions.createNode(),];
    root[0].children.push(child);
    this.state = { root, active: [] };
    this.initializeStore();
  }

  initializeStore() {
    this.store = createStore(Reducer, this.state);
  }

  initializeStoreCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    else {
      this.setState(this.store.getState());
      this.mounted = true;
    }
    this.unsubscribe = this.store.subscribe(() => {
      let state = this.store.getState();
      this.setState(state);
      if (this.note) {
        let note = this.note;
        let content = yaml.dump(state.root);
        this.componentManager.saveItemWithPresave(note, () => {
          note.content.text = content;
          note.content.preview_plain = "---";
          note.content.preview_html = null;
        });
      }
      this.forceUpdate();
    });
  }

  initializeTree(item) {
    this.note = item;
    let content = yaml.load(item.content.text);
    if (typeof content == "string") {
      this.store.dispatch(Actions.editBullet([0,0], content));
    }
    if (content != null) {
      Actions.fixTree(content[0]);
      this.store.dispatch(Actions.updateRoot(content));
    }
  }

  noteChange(item) {
    if (!this.note) {
      this.initializeTree(item);
      return;
    }
    if (this.note.uuid !== item.uuid) {
      this.initializeStore();
      this.initializeStoreCallback();
      this.initializeTree(item);
      return;
    }
    this.note = item;
  }


  navigate(index) {
    return () => {
      this.store.dispatch(Actions.updateActive([...this.state.active.slice(0, index+1)]));
    }
  }

  navigateHome() {
    this.store.dispatch(Actions.updateActive([]));
  }

  addChild() {
    let newUUID = uuidv1();
    this.store.dispatch(Actions.addBullet([0, ...this.state.active, -1], newUUID));
  }


  componentDidMount() {
    let permissions = [{ name: "stream-context-item" }];
    this.componentManager = new ComponentManager(permissions, () => {});
    this.componentManager.streamContextItem(this.noteChange.bind(this));
    this.initializeStoreCallback();

  }

  render() {
    const { root } = this.state;
    const { active } = this.state;
    const activeBullet = Actions.getNode([0, ...active], root);
    const activeTree = Actions.getTree([0, ...active], root);
    return (
      <div id="bullet-editor"
           className="p-4 w-100 h-100"
           style={{
             overflowX: "visible",
             whiteSpace: "wrap"
           }}>
        <div className="container d-flex flex-row">
          {active.length > 0 &&
            activeTree.map((node, index) =>
              <p className="pr-2" onClick={ (index === 0) ? this.navigateHome.bind(this) : this.navigate(index).bind(this) }>{ (index === 0) ? "Home" : node.content } ></p>
            )
          }
        </div>
        {active.length > 0 &&
          <div className="w-100 h-100">
            <h1 className="display-1" id="root-bullet-content">
              {activeBullet.content}
            </h1>
            <h1 className="display-5" id="root-bullet-note">
              {activeBullet.note}
            </h1>
            <hr></hr>
          </div>
        }
        <div id="root-bullet-children">
        { activeBullet.children.length > 0 &&
            activeBullet.children.map((child, index) =>
              <Bullet key={ child.id } position={ [...active, index] } store={ this.store } self={ child }></Bullet>
            )
        }
        { activeBullet.children.length === 0 &&
          <button style={{ background: "transparent", outline: 0, border: 0 }} onClick={ this.addChild.bind(this) }>+</button>
        }
        </div>
      </div>
    );
  }
}

export default App;
