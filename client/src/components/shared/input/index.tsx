import { HTMLInputTypeAttribute, InputHTMLAttributes } from 'react';
import styled from 'styled-components';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  type: HTMLInputTypeAttribute;
  id: string;
}

export const InputStyle = styled.input<Props>``;

const Input = ({ id, ...rest }: Props) => {
  return <InputStyle id={id} {...rest} />;
};

export default Input;
