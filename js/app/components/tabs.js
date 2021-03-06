define([
  'react',
  './tablistbutton',
  './createform',
  './importform'
],

function (React, TabListButton, CreateForm, ImportForm) {
  'use strict';

  var el = React.createElement;
  var PropTypes = React.PropTypes;

  return React.createClass({

    displayName: 'Tabs',

    propTypes: {
      data: PropTypes.arrayOf(PropTypes.object).isRequired,
      visible: PropTypes.bool,
      handleTabClick: PropTypes.func.isRequired,
      handleCreateNewTab: PropTypes.func.isRequired,
      handleImportTab: PropTypes.func.isRequired
    },

    getInitialState: function () {
      return {
        hideImportForm: true
      };
    },

    handleShowImportFormClick: function () {
      this.setState({
        hideImportForm: false
      });
    },

    handleImportTab: function (tabId) {
      this.props.handleImportTab(tabId);

      this.setState({
        hideImportForm: true
      });
    },

    render: function () {
      return (
        el('div', {className: 'scene tabsScene' + (this.props.visible ? '' : ' hidden')},
          el('div', {className: 'header'},
            el('img', {id: 'logo', src: 'images/favicon-touch.png'}),
            el('h2', null, 'Grouptabs')
          ),
          (
            this.props.data.length
            ?
            el('div', {className: 'row tabs'},
              this.props.data.map(function (tab) {
                return el(TabListButton, {key: tab.id, data: tab, onClick: this.props.handleTabClick});
              }.bind(this))
            )
            :
            el('div', {className: 'empty-info'},
              el('p', null,
                'With Grouptabs you can track shared expenses in a group of people.'
                + ' Every group or every topic has its own tab like "Roadtrip 2016" or "Badminton".'
              ),
              el('p', null,
                'You have no tabs, yet. Start by creating one:'
              )
            )
          ),
          el('div', {className: 'row'},
            el(CreateForm, {handleSubmit: this.props.handleCreateNewTab})
          ),
          el('div', {className: 'row'},
            this.state.hideImportForm
            ? el('p', {className: 'fake-link', onClick: this.handleShowImportFormClick}, 'Open shared tab')
            : el(ImportForm, {handleSubmit: this.handleImportTab})
          )
        )
      );
    }

  });

});
