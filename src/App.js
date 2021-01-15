/*
  Bruce's project
  Copyright (c) 2021 brucehe<bruce.he.62@gmail.com>
  
  See LICENSE.txt for more information
*/

import React from "react";
import "antd/dist/antd.css";
import { Input, Button, Upload, message, Popover, Dropdown, Menu } from "antd";
import {
  UploadOutlined,
  SettingOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import FileSaver from "file-saver";

import "./App.css";
import config, { setConfig } from "./config";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      settingsVisible: false, // a flag indicates whether Settings page is visible or not
      editingConfig: {}, // config in editting, so to not touch the actual config in case user wants to cancel the changes
      imageUploaded: false,
      srcImage: {},
      dstImage: {},
    };

    // uploadeFileList is used by the antd module for uploading images, refer to antd website for more info
    this.uploadFileList = [];

    // bind functions
    this.getUploadProps = this.getUploadProps.bind(this);
    this.onUpdateConfig = this.onUpdateConfig.bind(this);
    this.onConfigUpdated = this.onConfigUpdated.bind(this);
    this.onUploadImage = this.onUploadImage.bind(this);
  }

  /**
   * upload properties required by antd, please refer to antd website for more info
   * note that we only accept jpeg/png, and maximum 10m images
   *   - in the future we may use configuration instead of a hard-coded value
   * once successfully uploaded, we simply add the image info (from response)
   * to this.state.images without calling getImageList again
   */
  getUploadProps() {
    return {
      accept: "image/*",
      showUploadList: false,

      beforeUpload: (file) => {
        const isJpgOrPng =
          file.type === "image/jpeg" || file.type === "image/png";
        if (!isJpgOrPng) {
          message.error("You can only upload JPG/PNG file!");
          return false;
        }
        const isLt2M = file.size / 1024 / 1024 < 10;
        if (!isLt2M) {
          message.error("Image must smaller than 10MB!");
          return false;
        }

        this.onUploadImage(file);
        return false;
      },
    };
  }

  onUploadImage(file) {
    this.setState({ srcImage: {}, dstImage: {}, imageUploaded: true });
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        // convert image file to base64 string
        this.setState({ srcImage: { url: reader.result } });
      },
      false
    );
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("image", file);
    fetch(`${config.serverUrl}/image/cartoon`, {
      method: "POST",
      body: formData,
    })
      .then((resp) => {
        return resp.blob();
      })
      .then((blob) => {
        this.setState({ dstImage: { blob, url: URL.createObjectURL(blob) } });
      });
  }

  /**
   * save temporarily modified configuration to editingConfig
   * we don't save it directly to config because user may cancel the settings
   * @param {*} name
   * @param {*} e
   */
  onUpdateConfig(name, e) {
    const editingConfig = { ...this.state.editingConfig };
    editingConfig[name] = e.target.value;
    this.setState({ editingConfig });
  }

  /**
   * so user decides to permanently change the configuration
   */
  onConfigUpdated() {
    const { editingConfig } = this.state;
    for (let [key, value] of Object.entries(editingConfig)) {
      config[key] = value;
    }
    setConfig("config", config);
  }

  renderSettings() {
    const { editingConfig } = this.state;
    return (
      <div style={{ margin: "8px" }}>
        <Input
          style={{ margin: "16px" }}
          value={editingConfig.serverUrl}
          onChange={(e) => this.onUpdateConfig("serverUrl", e)}
        />
        <div style={{ display: "flex" }}>
          <span style={{ flex: "auto" }} />
          <Button onClick={(e) => this.setState({ settingsVisible: false })}>
            Cancel
          </Button>
          <Button
            type="primary"
            style={{ margin: "0 0 0 16px" }}
            onClick={(e) => {
              this.setState({ settingsVisible: false });
              this.onConfigUpdated(false);
            }}
          >
            OK
          </Button>
        </div>
      </div>
    );
  }

  /**
   * utilize antd's Upload component, here we use a very simply implementation,
   * there are many other fancy implementations, such as preview, can be found in antd's website
   * @param {*} type
   */
  renderUploadButton() {
    const { imageUploaded } = this.state;
    return (
      <Upload {...this.getUploadProps()} fileList={this.uploadFileList}>
        <Button
          icon={<UploadOutlined />}
          onClick={() => {
            this.uploadFileList = [];
          }}
          style={{ margin: "16px 16px 0 0" }}
        >
          {imageUploaded ? "Upload another image?" : "Upload an image"}
        </Button>
      </Upload>
    );
  }

  renderSrcImage() {
    const {
      srcImage: { url },
    } = this.state;
    if (url) {
      return <img src={url} className="img-container" alt="" />;
    }
    return (
      <div>
        Loading image....
        <LoadingOutlined />
      </div>
    );
  }

  renderDstImage() {
    const {
      dstImage: { blob, url },
    } = this.state;
    if (url) {
      const menu = (
        <Menu
          onClick={({ item, key }) => {
            FileSaver.saveAs(blob, "imgutil.jpeg");
          }}
        >
          <Menu.Item key="download">Download</Menu.Item>
        </Menu>
      );

      return (
        <Dropdown overlay={menu} placement="bottomCenter" arrow>
          <img src={url} className="img-container" alt="" />
        </Dropdown>
      );
    }

    return (
      <div>
        Working hard on it....
        <LoadingOutlined />
      </div>
    );
  }

  render() {
    const { settingsVisible, imageUploaded } = this.state;
    return (
      <div className="app">
        <div style={{ display: "flex" }}>
          <span className="app-title">
            Bruce's Image Utilities - Cartoonize Image
          </span>
          <span style={{ flex: "auto" }} />
          <Popover
            placement="topLeft"
            title={"Settings"}
            visible={settingsVisible}
            onVisibleChange={(visible) => {
              this.setState({
                editingConfig: { ...config },
                settingsVisible: visible,
              });
            }}
            content={this.renderSettings.bind(this)}
            trigger="click"
          >
            <SettingOutlined />
          </Popover>
        </div>
        {this.renderUploadButton()}
        <div>
          {imageUploaded && this.renderSrcImage()}
          {imageUploaded && this.renderDstImage()}
        </div>
      </div>
    );
  }
}

export default App;
