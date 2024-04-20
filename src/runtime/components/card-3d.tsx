/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import { FloodWidgetContext } from '../widget-context'
import { Button, Card, Label, Modal, ModalBody, ModalFooter } from 'reactstrap/lib';
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning';
import { getModalStyle } from '../style';
import { useContext, useState } from 'react';
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info';
import { Flood3d } from './flood-3d';
import { Flood3dData } from '../../config';
import { ModalHeader } from 'reactstrap';
import { Icon } from 'jimu-ui';

const iconClose = require('jimu-ui/lib/icons/close-12.svg')

function Card3D() {
      const { theme} = useContext(FloodWidgetContext)
      const { flood3dData} = useContext(FloodWidgetContext)
      const { currentMapPoint} = useContext(FloodWidgetContext)
      const [showDialog, setShowDialog] = useState(false)
      const [is3dModelView, setIs3dModelView] = useState(false)
      

      const restrictWarningTips = "warning tip"
      const waterElevation = flood3dData.waterElevation
      const showHideDialog = () => {
            setShowDialog(!showDialog)
            setIs3dModelView(!is3dModelView)
      }
      
      return (
            <div css={getModalStyle(theme)}>
                  <Card className='info-card-feature'>
                        <div>
                              <div className='section-wrapper'>
                                    <div className='img-message'>                                       
                                          {flood3dData.message}
                                    </div>
                                    {flood3dData.show3DModel && 
                                          <div className='img-btn'>
                                                <img src={require('./../assets/3d-switch.png')} height={60} onClick={showHideDialog} />
                                          </div>
                                    }
                              </div>
                              {showDialog &&

                                    <Modal isOpen centered css={getModalStyle(theme)}>
                                          <ModalHeader>
                                                <div className="text-right">
                                                <Button role={'button'} aria-label={'close'} title={'close'}
                                                      className={'ml-2 close-icon'} icon size={'sm'} onClick={showHideDialog}>
                                                      <Icon icon={iconClose} size={16} /></Button>
                                                </div>
                                          </ModalHeader>
                                          <ModalBody>
                                                <div className='d-flex align-items-start'>
                                                      <Flood3d waterElevation={waterElevation} />
                                                </div>  
                                          </ModalBody>
                                    </Modal>
                              }
                        </div>
                  </Card>
            </div>
      )

}
export default Card3D
