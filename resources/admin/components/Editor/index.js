import React, {Component} from 'react';
import tinymce from "tinymce/tinymce";

import 'tinymce/themes/modern/theme';

import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/contextmenu';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/imagetools';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/link';
import 'tinymce/plugins/media';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/tabfocus';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/directionality';
import 'tinymce/plugins/image';
import 'tinymce/plugins/importcss';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/pagebreak';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/table';
import 'tinymce/plugins/textcolor';
import 'tinymce/plugins/emoticons';

class Editor extends Component {
	componentDidMount() {
		const {value} = this.props;

		tinymce.init({
			target  : this.textarea,
			skin    : false,
			toolbar : [
				'undo redo',
				'bold italic forecolor underline strikethrough',
				'alignleft aligncenter alignright',
				'image editimage link media emoticons'
			].join(" | "),
			plugins : [
				'autolink lists link image charmap preview hr anchor',
				'pagebreak searchreplace wordcount importcss',
				'insertdatetime media nonbreaking table contextmenu',
				'directionality paste textcolor imagetools hr'
			],
			setup   : editor => {
				editor.on('init', () => {
					editor.setContent(value);
				});

				editor.on('keyup change', () => {
					clearTimeout(this.timer);
					const content = editor.getContent();
					this.isTyping = true;

					this.timer = setTimeout(() => {
						this.isTyping = false;
					}, 500);

					this.triggerChange(content);
				});

				this.editor = editor;
			}
		});
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const {value} = this.props;
		if (prevProps.value !== value && !this.isTyping) {
			this.editor && this.editor.setContent(value);
			console.log("TinyMce Updated")
		}
	}

	triggerChange(value) {
		const {onChange} = this.props;
		if (typeof onChange === "function") {
			return onChange(value)
		}
	}

	componentWillUnmount() {
		tinymce.remove(this.editor);
	}

	render() {
		return (
			<textarea ref={(ref) => this.textarea = ref}/>
		)
	}
}

export default Editor;