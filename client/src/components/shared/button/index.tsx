import { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const ButtonStyle = styled.button<Props>`
  outline: none;
  background-color: ${(props) => props.theme.colors.main_dark};
  color: ${(props) => props.theme.colors.white};
  font-size: 22px;
  border: 4px solid ${(props) => props.theme.colors.white};
  border-radius: 12px;
  padding: 0.5rem 1.5rem;
  font-weight: 700;
  transition: all 230ms ease-in-out;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${(props) => props.theme.colors.main};
    border: 3.5px solid ${(props) => props.theme.colors.white};
    color: ${(props) => props.theme.colors.white};
  }
`;

const Button = ({ children, onClick, type, ...rest }: Props) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ButtonStyle type={type} onClick={onClick} {...rest}>
      {children}
    </ButtonStyle>
  );
};

export default Button;
