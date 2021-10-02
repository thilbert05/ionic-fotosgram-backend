import fileUpload from 'express-fileupload';

export interface FileUpload {
  name:         string;
  data:         Data;
  size:         number;
  encoding:     string;
  tempFilePath: string;
  truncated:    boolean;
  mimetype:     string;
  md5:          string;

  mv(path: string, callback: (err: any) => void): void;
}

export interface Data {
  type: string;
  data: number[];
}