/** @jsx jsx */
import { React, jsx, css, defaultMessages as jimuCoreMessages, hooks, type ImmutableArray, Immutable, IMDataSourceJson, i18n, dataSourceUtils, DataSourceStatus, IMState } from 'jimu-core'
import { defaultMessages as jimuUIMessages, Button, Popper, PanelHeader, Alert, MobilePanel, Tabs, Tab, Loading, Icon, LoadingType } from 'jimu-ui'

import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'

import defaultMessages from '../../translations/default'
import { type DataOptions } from './types'
import { DataUrlInput } from './data-url-input'
import { DataCollapse } from './data-collapse'
import { useEffect } from 'react'
import { type ItemCategoryInfo } from '../../../config'
import { SidePopper } from 'jimu-ui/advanced/setting-components'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'
import { useSelector } from 'react-redux'
import { createDataSourcesByDataOptions, destroyDataSourcesById, getDataSource, usePrevious } from './utils'
import { EndPointConfig } from './end-point-config'

export interface AddRestPointProps {
  hiddenTabs: SupportedTabs[]
  widgetId: string
  buttonSize: 'sm' | 'lg'
  nextOrder: number
  itemCategoriesInfo?: ImmutableArray<ItemCategoryInfo>
  hidePopper?: boolean
  onFinish: (multiDataOptions: DataOptions[]) => void
}

const { useState, useMemo, useRef } = React

const SUPPORTED_TABS = ['url', 'display', 'fields'] as const

export type SupportedTabs = typeof SUPPORTED_TABS[number]

export const AddRestPoint = (props: AddRestPointProps) => {
  const { widgetId, buttonSize, hiddenTabs,
     nextOrder: propsNextOrder, onFinish: propsOnFinish, itemCategoriesInfo, hidePopper } = props
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>(null)
  const [multiDataOptionsFromUrl, setMultiDataOptionsFromUrl] = useState<DataOptions[]>([])
  const multiDataOptions = useMemo(() => multiDataOptionsFromUrl.sort((d1, d2) => d1.order - d2.order), [multiDataOptionsFromUrl])
  const nextOrder = useMemo(() => multiDataOptions.length > 0 ? Math.max(...multiDataOptions.map(d => d.order)) + 1 : propsNextOrder, 
    [multiDataOptions, propsNextOrder])
  const tabs: SupportedTabs[] = useMemo(() => SUPPORTED_TABS.filter(t => !hiddenTabs?.some(hiddenT => t === hiddenT)), [hiddenTabs])

  const translate = hooks.useTranslation(jimuUIMessages, jimuCoreMessages, defaultMessages)
  const hideErrorMsgTimer = useRef<NodeJS.Timeout>(null)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const prevMultiDataOptions = usePrevious(multiDataOptions)
  
  const addDataButtonRef = useRef<HTMLButtonElement>()

  useEffect(() => {
    if (errorMsg && !hideErrorMsgTimer.current) {
      hideErrorMsgTimer.current = setTimeout(() => {
        setErrorMsg(null)
        hideErrorMsgTimer.current = null
      }, 5000)
    }

     // Remove data based on diff.
     const removedMultiDataOptions = prevMultiDataOptions?.filter(prevD => !multiDataOptions.some(d => d.dataSourceJson.id === prevD.dataSourceJson.id)) || []
     destroyDataSourcesById(removedMultiDataOptions.map(d => d.dataSourceJson.id), widgetId, false)
 
     // Create data based on diff.
     setIsLoading(true)
     const addedMultiDataOptions = multiDataOptions.filter(d => !prevMultiDataOptions?.some(prevD => d.dataSourceJson.id === prevD.dataSourceJson.id))
     createDataSourcesByDataOptions(addedMultiDataOptions, widgetId, false).catch(err => {
       setErrorMsg(translate('dataSourceCreateError'))
     }).finally(() => {
       setIsLoading(false)
     })
  }, [widgetId, multiDataOptions, prevMultiDataOptions, errorMsg, setErrorMsg])

  const onRemove = (dsId: string) => {
    if (multiDataOptionsFromUrl.some(d => d.dataSourceJson.id === dsId)) {
      setMultiDataOptionsFromUrl(multiDataOptionsFromUrl.filter(d => d.dataSourceJson.id !== dsId))
    }

  }

  const onFinish = (multiDataOptions: DataOptions[]) => {
    propsOnFinish(multiDataOptions)
    
    togglePopper()
  }

  const togglePopper = () => {
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)
    // When closing popper, need to reset the added data.
    if (!newIsOpen) {
      setMultiDataOptionsFromUrl([])

      if (addDataButtonRef.current) {
        addDataButtonRef.current.focus()
      }
    }
  }

  useEffect(() => {
    if (hidePopper && isOpen) {
      togglePopper()
    }
  }, [hidePopper])

  const getPopperContent = () => {
    return <PopperContent
      tabs={tabs}
      errorMsg={errorMsg} 
      translate={translate}
      togglePopper={togglePopper}
      onFinish={onFinish}
      onRemove={onRemove}
      widgetId={widgetId}
      nextOrder={nextOrder}
      multiDataOptions={multiDataOptions}
      multiDataOptionsFromUrl={multiDataOptionsFromUrl}
      setErrorMsg={setErrorMsg}
      setMultiDataOptionsFromUrl={setMultiDataOptionsFromUrl}
      itemCategoriesInfo={itemCategoriesInfo} />
  }

  return <div className='add-rest-point' css={style}>
    {
      buttonSize === 'lg' &&
      <Button type='primary' className='flex-grow-1 text-center' onClick={togglePopper} aria-label={translate('addData')} ref={addDataButtonRef}>
        <div className='w-100 px-2 d-flex align-items-center justify-content-center'>
          <PlusOutlined size='m' />
          <div className='text-truncate' title={translate('clickToAddData')}>
            {translate('clickToAddData')}
          </div>
        </div>
      </Button>
    }
    {
      buttonSize === 'sm' &&
      <Button type='primary' className='d-flex justify-content-center align-items-center small-add-btn' onClick={togglePopper} aria-label={translate('addData')} ref={addDataButtonRef}>
        <PlusOutlined size='m' className='m-0' />
      </Button>
    }

    <EndPointConfig multiDataOptions={multiDataOptions} widgetId={widgetId} onFinish={onFinish} onRemove={onRemove} setErrorMsg={setErrorMsg} />

    <SidePopper
      isOpen={isOpen}
      position="right"
      toggle={togglePopper}
      trigger={null}
      title={translate('addData')}>
      {getPopperContent()}
    </SidePopper>

  </div>
}


const TabContent = ({ tab, widgetId, nextOrder, multiDataOptionsFromUrl,
  setMultiDataOptionsFromUrl, setErrorMsg }: {
    tab: SupportedTabs,
    widgetId: string, nextOrder: number,
    multiDataOptionsFromUrl: DataOptions[],
    setMultiDataOptionsFromUrl: (multiDataOptions: DataOptions[]) => void,
    setErrorMsg: (msg: string) => void, itemCategoriesInfo?: ImmutableArray<ItemCategoryInfo>
  }) => {

  if (tab === 'fields') {
    return <div>TODO Fields</div>
  } else if (tab === 'url') {
    return <DataUrlInput widgetId={widgetId} onChange={setMultiDataOptionsFromUrl}
      nextOrder={nextOrder}
      multiDataOptions={multiDataOptionsFromUrl}
      setErrorMsg={setErrorMsg} />
  } else if (tab === 'display') {
    return <div>TODO Display</div>
  }
}


const PopperContent = ({ errorMsg, translate, tabs, togglePopper, onFinish, onRemove, widgetId, nextOrder, 
  multiDataOptions,  multiDataOptionsFromUrl,
    setMultiDataOptionsFromUrl, setErrorMsg, 
   itemCategoriesInfo }: { errorMsg: string, translate: (id: string, values?: any) => string, 
  tabs: SupportedTabs[], togglePopper: () => void, onFinish: (multiDataOptions: DataOptions[]) => void, 
  onRemove: (dsId: string) => void, widgetId: string, nextOrder: number, multiDataOptions: DataOptions[], 
   multiDataOptionsFromUrl: DataOptions[],
   
  setMultiDataOptionsFromUrl: (multiDataOptions: DataOptions[]) => void, 
  
  setErrorMsg: (msg: string) => void, itemCategoriesInfo?: ImmutableArray<ItemCategoryInfo> }) => {
  return <div css={css`
    width: ${'100%'};
    height: ${'100%'};
    .add-data-popper-content {
      position: relative;
      height: ${'calc(100% - 56px)'};
    }
    .tab-content {
      overflow: hidden;
    }
    .jimu-nav {
      border-bottom: 1px solid var(--light-400);
    }
    .multiple-lines-truncate {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      word-break: break-word;
      word-wrap: break-word;
    }
    .item-selector-search {
      .text-input-prefix {
        svg {
          margin-left: 0 !important;
          color: var(--light-800) !important;
        }
      }
    }
  `}>
    { <PanelHeader title={translate('addData')} showClose={true} onClose={togglePopper} level={1} className='p-3' /> }
    <div className='add-data-popper-content'>
      {
        tabs.length > 1 && <Tabs type='underline' className='w-100 h-100' fill defaultValue={tabs[0]}>
          {
            tabs.map((t, i) => <Tab key={i} id={t} title={translate(t)}>
              <TabContent tab={t}  widgetId={widgetId} nextOrder={nextOrder} setErrorMsg={setErrorMsg}
               multiDataOptionsFromUrl={multiDataOptionsFromUrl} 
               setMultiDataOptionsFromUrl={setMultiDataOptionsFromUrl} 
               itemCategoriesInfo={itemCategoriesInfo} />
            </Tab>)
          }
        </Tabs>
      }
      {
        tabs.length === 1 && <div className='w-100 h-100'>
          <TabContent tab={tabs[0]}  widgetId={widgetId} nextOrder={nextOrder} setErrorMsg={setErrorMsg}
           multiDataOptionsFromUrl={multiDataOptionsFromUrl}
            setMultiDataOptionsFromUrl={setMultiDataOptionsFromUrl} 
            itemCategoriesInfo={itemCategoriesInfo} />
        </div>
      }
      {
        errorMsg && <Alert className='w-100' css={css`position: absolute; top: ${tabs.length === 1 ? 0 : '33px'}; left: 0; right: 0; z-index: 1;`} closable form='basic' onClose={() => { setErrorMsg(null) }} open text={errorMsg} type='warning' withIcon />
      }
    </div>
    <DataCollapse multiDataOptions={multiDataOptions} widgetId={widgetId} onFinish={onFinish} onRemove={onRemove} setErrorMsg={setErrorMsg} />
  </div>
}

const style = css`
  .small-add-btn {
    border-radius: 16px;
    width: 32px;
    height: 32px;
    padding: 0;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  }
`
