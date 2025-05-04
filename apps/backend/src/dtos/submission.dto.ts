import { IsNotEmpty, IsString, Length, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class SubmitDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  public images: string[];

  @IsString()
  @IsNotEmpty()
  @Length(42, 42) // 42 is the length of an Vechain address including the 0x prefix
  public address: string;

  @IsString()
  @IsNotEmpty()
  public deviceID: string;
}
