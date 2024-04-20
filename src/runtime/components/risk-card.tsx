/** @jsx jsx */
import Color from 'color'
import { React, css, jsx, IconResult, classNames, polished } from 'jimu-core'
import { Button, Icon, ButtonProps, ButtonSize, Tooltip } from 'jimu-ui'
import { DisplaySection, RiskCard } from '../../config'

export const LABEL_HEIGHT = 21
export type AvatarSize = ButtonSize


const getColor = (floodType: 'high' | 'medium' | 'low' | 'none'): string => {
  switch (floodType) {
    case 'high':
      return 'red'
    case 'medium':
      return 'orange'
    case 'low':
      return 'green'
    case 'none':
      return 'yellow'
    default:
      return 'gray'
  }
}



export interface RiskCardProps extends React.HTMLAttributes<HTMLDivElement> {
  riskCard: RiskCard
}

const useStyle = () => {
  return React.useMemo(() => {
    const width = length
    return css`
      display: flex;
      align-items:center;
      flex-direction: column;
      justify-content: 'center'};
      white-space: normal;
      width: ${polished.rem(width)} !important;
      .risk-card {
        display: flex;
        padding:10px;
        flex-flow: row;
      }
      .risk-card-icon {
        margin: auto;
      }
      .risk-card-content {
        margin-left: 10px;
        width: -webkit-fill-available;
      }
      .risk-card-low {
        background-color: gray;
      }
      .risk-card-medium {
        background-color: orange;
      }
      .risk-card-high {
        background-color: red;
      }
      .risk-card-none {
        background-color: green;
      }

      .risk-header h3 {
        text-align: center;
        width: 100%;
        min-height: ${polished.rem(21)};
        cursor: default;
        white-space: normal;
      }
      .risk-description {
        text-align: center;
        width: 100%;
        min-height: ${polished.rem(21)};
        cursor: default;
        white-space: normal;
      }

      .risk-btn {
        text-align: center;
        min-height: ${polished.rem(21)};
        cursor: default;
        white-space: normal;
        margin:20px;
      }
    `
  }, [])
}

export const RiskCardComponent = React.forwardRef((props: RiskCardProps, ref: React.RefObject<HTMLButtonElement>) => {
  const {
    riskCard
  } = props

  const cssStyle = useStyle()


  const openInfo = () => {
    window.open(riskCard.linkUrl, "_blank")
  }

  return (
    riskCard && <div
      className={classNames(`risk-card-${riskCard.cardType}`)}
      css={cssStyle}
    >
      <div className={classNames('risk-card')}>
        <div className="risk-card-icon"> <img src={require(`./../assets/flood-alerts-${riskCard.cardType}.png`)} height={"70"} /></div>
        <div className='risk-card-content'>
          <div className={classNames('risk-header text-truncate')}><h3>{riskCard.cardHeader}</h3></div>
          <div className={classNames('risk-description text-truncate')}>{riskCard.cardDescription}</div>

          <div className='risk-btn' >
            <Button type='primary' size="sm" onClick={openInfo}>
              {riskCard.linkLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})
