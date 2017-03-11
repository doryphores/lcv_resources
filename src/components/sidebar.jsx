import React from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { selectSong, RESIZE_SIDEBAR, TOGGLE_SIDEBAR } from '../actions'
import Icon from './icon'
import Resizer from './resizer'
import KeyCapture from '../key_capture'

class Sidebar extends React.Component {
  constructor () {
    super()
    this.state = {
      search: '',
      highlighted: -1,
      searching: false
    }

    this.toggleKeyCapture = new KeyCapture({
      'S': () => {
        if (!this.props.visible) this.props.toggleSidebar()
        this.refs.searchInput.select()
      }
    })

    this.searchingKeyCapture = new KeyCapture({
      'enter': () => {
        if (this.state.highlighted > -1) {
          this.props.onSelect(this.filterSongs()[this.state.highlighted].title)
          this.refs.searchInput.blur()
        }
      },
      'escape': () => this.refs.searchInput.blur(),
      'up': () => this.updateHighlighted(this.state.highlighted - 1),
      'down': () => this.updateHighlighted(this.state.highlighted + 1)
    })
  }

  componentDidMount () {
    if (this.props.selectedSongTitle) {
      document.querySelector('.sidebar__menu-item--selected').scrollIntoView()
    }
    this.toggleKeyCapture.activate()
  }

  componentWillUnmount () {
    this.toggleKeyCapture.deactivate()
    this.searchingKeyCapture.deactivate()
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.highlighted > -1 && prevState.highlighted !== this.state.highlighted) {
      let highlightedElement = this.refs[`item-${this.state.highlighted}`]
      let listRect = this.refs.songList.getBoundingClientRect()
      let itemRect = highlightedElement.getBoundingClientRect()
      if (itemRect.bottom > listRect.bottom) {
        highlightedElement.scrollIntoView(false)
      } else if (itemRect.top < listRect.top) {
        highlightedElement.scrollIntoView(true)
      }
    }

    if (prevProps.visible !== this.props.visible) {
      window.dispatchEvent(new window.Event('resize'))
    }
  }

  updateHighlighted (value) {
    let listLength = this.filterSongs().length
    if (value < 0) {
      value = listLength - 1
    } else if (value >= listLength) {
      value = 0
    }
    this.setState({ highlighted: value })
  }

  filterSongs () {
    if (this.state.search === '') return this.props.songs
    let searchString = this.state.search.toLowerCase()
    return this.props.songs.filter(s => {
      return s.title.toLowerCase().includes(searchString)
    })
  }

  startSearch () {
    this.setState({
      searching: true,
      highlighted: this.filterSongs().findIndex(s => s.title === this.props.selectedSongTitle)
    })
    this.searchingKeyCapture.activate()
  }

  stopSearch () {
    this.setState({
      searching: false,
      highlighted: -1
    })
    this.searchingKeyCapture.deactivate()
  }

  handleSearch (e) {
    this.setState({
      search: e.target.value,
      highlighted: -1
    })
  }

  classNames (classNames) {
    return classnames(classNames, this.props.className, {
      'sidebar--collapsed': !this.props.visible
    })
  }

  itemClassNames (title, index) {
    return classnames('sidebar__menu-item', {
      'sidebar__menu-item--selected': title === this.props.selectedSongTitle,
      'sidebar__menu-item--highlighted': index === this.state.highlighted
    })
  }

  render () {
    return (
      <div className={this.classNames('sidebar u-flex u-flex--vertical')}
        style={{ width: this.props.width }}>
        <div className='sidebar__search u-flex__panel'>
          <input ref='searchInput'
            type='text'
            placeholder='Search'
            className='sidebar__search-field field__input'
            value={this.state.search}
            onFocus={this.startSearch.bind(this)}
            onBlur={this.stopSearch.bind(this)}
            onChange={this.handleSearch.bind(this)} />
          <Icon icon='search' className='sidebar__icon sidebar__search-icon' />
          <Icon icon='close'
            className='sidebar__icon sidebar__close-icon'
            style={{ display: this.state.search === '' ? 'none' : 'block' }}
            onClick={() => this.setState({ search: '' })} />
        </div>
        <ul ref='songList'
          className='sidebar__menu u-flex__panel u-flex__panel--grow'>
          {this.filterSongs().map((s, i) => (
            <li key={s.title}
              ref={`item-${i}`}
              className={this.itemClassNames(s.title, i)}
              onClick={() => this.props.onSelect(s.title)}>
              {s.title}
            </li>
          ))}
        </ul>
        <Resizer className='sidebar__resizer'
          onResize={this.props.onResize} />
      </div>
    )
  }
}

function mapDispatchToProps (dispatch) {
  return {
    toggleSidebar: () => dispatch({ type: TOGGLE_SIDEBAR }),
    onSelect: (title) => dispatch(selectSong(title)),
    onResize: (width) => dispatch({
      type: RESIZE_SIDEBAR,
      payload: width
    })
  }
}

function mapStateToProps (state) {
  return {
    selectedSongTitle: state.selectedSong.title,
    songs: state.songs,
    visible: state.ui.sidebarVisible,
    width: state.ui.sidebarWidth
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
