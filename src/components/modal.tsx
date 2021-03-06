import React from 'react'

import KeyCapture from '../key_capture'
import Overlay from './overlay'

interface ModalProps {
  readonly open: boolean
  readonly className?: string
  readonly buttonLabel: string
  readonly title: string
  readonly onSubmit: () => void
  readonly onCancel: () => void
  readonly children: React.ReactNode
}

export default class Modal extends React.Component<ModalProps> {
  private keyCapture: KeyCapture

  constructor (props: ModalProps) {
    super(props)

    this.keyCapture = new KeyCapture({
      'Escape': props.onCancel
    })
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    this.props.onSubmit()
  }

  handleCancel = () => {
    this.props.onCancel()
  }

  componentWillUnmount () {
    this.keyCapture.deactivate()
  }

  componentWillReceiveProps (nextProps: ModalProps) {
    if (nextProps.open && !this.props.open) {
      this.keyCapture.activate()
    } else if (!nextProps.open && this.props.open) {
      this.keyCapture.deactivate()
    }
  }

  render () {
    return (
      <Overlay open={this.props.open} className={this.props.className}>
        <form className='modal__panel' onSubmit={this.handleSubmit}>
          <h2 className='modal__heading'>{this.props.title}</h2>
          {this.props.children}
          <div className='form-actions'>
            {this.props.onCancel && (
              <button className='button' type='button' onClick={this.handleCancel}>
                Cancel
              </button>
            )}
            <button className='button'>{this.props.buttonLabel}</button>
          </div>
        </form>
      </Overlay>
    )
  }
}
