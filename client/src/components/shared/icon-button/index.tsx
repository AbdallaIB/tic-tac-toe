import { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const ButtonStyle = styled.button<Props>`
  outline: none;
  background-color: ${(props) => props.theme.colors.main_dark};
  color: ${(props) => props.theme.colors.white};
  font-size: 30px;
  border: 4px solid ${(props) => props.theme.colors.white};
  border-radius: 50%;
  transition: all 230ms ease-in-out;
  cursor: pointer;
  height: 3rem;
  width: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${(props) => props.theme.colors.main};
    border: 3px solid ${(props) => props.theme.colors.white};
    color: ${(props) => props.theme.colors.white};
  }
`;

const IconButton = ({ children, onClick, type = 'button', ...rest }: Props) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ButtonStyle type={type} onClick={onClick} {...rest}>
      {children}
    </ButtonStyle>
  );
};

export default IconButton;
