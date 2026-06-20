/**
 * @license Copyright (c) 2014-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import type { EditorConfig } from "@ckeditor/ckeditor5-core";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor.js";
import Autoformat from "@ckeditor/ckeditor5-autoformat/src/autoformat.js";
import BlockQuote from "@ckeditor/ckeditor5-block-quote/src/blockquote.js";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold.js";
import CloudServices from "@ckeditor/ckeditor5-cloud-services/src/cloudservices.js";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials.js";
import FontColor from "@ckeditor/ckeditor5-font/src/fontcolor.js";
import FontSize from "@ckeditor/ckeditor5-font/src/fontsize.js";
import Heading from "@ckeditor/ckeditor5-heading/src/heading.js";
import {
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  PictureEditing,
} from "@ckeditor/ckeditor5-image";
import Indent from "@ckeditor/ckeditor5-indent/src/indent.js";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic.js";
import Link from "@ckeditor/ckeditor5-link/src/link.js";
import List from "@ckeditor/ckeditor5-list/src/list.js";
import MediaEmbed from "@ckeditor/ckeditor5-media-embed/src/mediaembed.js";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph.js";
import PasteFromOffice from "@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js";
import SourceEditing from "@ckeditor/ckeditor5-source-editing/src/sourceediting.js";
import {
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
} from "@ckeditor/ckeditor5-table";
import TextTransformation from "@ckeditor/ckeditor5-typing/src/texttransformation.js";
import Alignment from "@ckeditor/ckeditor5-alignment/src/alignment.js";
import { Base64UploadAdapter } from "@ckeditor/ckeditor5-upload";

class Editor extends ClassicEditor {
  // Plugins to include in the build.
  public static override builtinPlugins = [
    Autoformat,
    BlockQuote,
    Base64UploadAdapter,
    Bold,
    CloudServices,
    Essentials,
    FontColor,
    FontSize,
    Heading,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    PictureEditing,
    Indent,
    Italic,
    Link,
    List,
    MediaEmbed,
    Paragraph,
    PasteFromOffice,
    SourceEditing,
    Table,
    TableCaption,
    TableCellProperties,
    TableColumnResize,
    TableProperties,
    TableToolbar,
    TextTransformation,
    Alignment,
  ];

  // Editor configuration.
  public static override defaultConfig: EditorConfig = {
    toolbar: {
      items: [
        "heading",
        "|",
        "fontSize",
        "fontColor",
        "bold",
        "italic",
        "link",
        "bulletedList",
        "numberedList",
        "|",
        "outdent",
        "indent",
        "|",
        "imageUpload",
        "blockQuote",
        "insertTable",
        "mediaEmbed",
        "undo",
        "redo",
        "sourceEditing",
        "alignment",
      ],
    },
    language: "fa",
    image: {
      toolbar: [
        "imageTextAlternative",
        "toggleImageCaption",
        "imageStyle:inline",
        "imageStyle:block",
        "imageStyle:side",
      ],
    },
    table: {
      contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
    },
  };
}
export default Editor;
