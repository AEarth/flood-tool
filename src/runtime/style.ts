import { IMThemeVariables, css, SerializedStyles, polished } from 'jimu-core'

export function getStyle(theme: IMThemeVariables): SerializedStyles {
  return css`
    .info-card-link  {
      color: ${theme.colors.dark};
      text-decoration: underline;
    }
    .info-card-feature {
      padding:0 10px;
      margin: 0 0 10px 0;
      
    }

    .flood-tool {
      overflow:auto;
   }

    .info-card-header {
      padding: 10px;
      background-color: ${theme.colors.secondary}
    }
    .flood-loader {
      padding: 80px 0;
      text-align: center;
    }

    .flood-warning-text {
      padding: 80px 10px;
      justify-content: center;
      text-align:center;
    }

    .flood-loader .alert-panel {
      width:100% !important;
    }

    .lat-long {
      padding: 0 10px;
      margin-bottom: 0;
    }
  `
}


export function getModalStyle(theme: IMThemeVariables): SerializedStyles {
  return css`
  .section-wrapper {
    display: flex;
    flex-direction: row;
  }
  .img-message {
    align-self: flex-start;
    margin-right:20px;
  }
  .img-btn {
    align-self: flex-end;
    margin-left:auto;
  }

  .img-btn img {
    cursor: pointer;
  }
  .close-icon {
    background-color: #fff;
    border: 1px solid #c5c5c5;
    border-radius: 15px 15px 15px 15px;
    transform: ;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    text-decoration: none;
  }
  .modal-title {
    margin: 0;
    padding: 10px;
  }
  .flood-3d-model {
    margin: 20px 0;
  }
    .modal {
      border: none;
      
    }
    .modal-body{
      overflow-y: auto;
      padding: 0;
    }
    .modal-content{
      width: auto;
      background-color: white;
      hight:auto;
      border: none;
      box-shadow: unset;
      border-radius: 10px;
    }
    .modal-footer{
      padding: 0;
      margin-top: 30px;
      .btn {
        min-width: 80px;
        + .btn {
          margin-left: 10px;
        }
      }
    }
    &.modal-dialog{
      width: 70%;
      hight:70%;
      margin: auto;
      position: relative;
      top: 50%;
      transform: translateY(-50%);
    }

    .title-icon {
      padding: 0 6px;
    }
    .title-label {
      font-size: 1rem;
      color: var(--black);
    }

    .message {
      margin-left: 36px;
      margin-top: 1rem;
    }
  `
}




export function get3dStyle(theme: IMThemeVariables): SerializedStyles {
  return css`
  .flood-3d {
    hight:600px;
    width:100%;
  }
  `
}