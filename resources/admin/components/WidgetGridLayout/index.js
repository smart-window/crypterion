import React, {Component} from 'react';
import {assign, forEach, forOwn, isArray, isNaN, omit} from "lodash";
import {Responsive, WidthProvider} from 'react-grid-layout';

const ResponsiveLayout = WidthProvider(Responsive);

class WidgetGridLayout extends Component {
	convertToLayouts = (dimensions) => {
		const output = {};
		forOwn(dimensions, (dimension, key) => {
			forEach(dimension, (o) => {
				if (!isArray(output[o.breakpoint])) {
					output[o.breakpoint] = [];
				}

				const layout = assign({}, omit(o, ['breakpoint']), {i : key});

				this.autoCorrect(layout);

				output[o.breakpoint].push(layout);
			});
		});
		return output;
	};

	autoCorrect(units) {
		if (this.validateUnit(units.minW) && units.minW > units.w) {
			units.minW = units.w;
		}

		if (this.validateUnit(units.minH) && units.minH > units.h) {
			units.minH = units.h;
		}

		if (this.validateUnit(units.maxW) && units.maxW < units.w) {
			units.maxW = units.w;
		}

		if (this.validateUnit(units.maxH) && units.maxH < units.h) {
			units.maxH = units.h;
		}
	}

	validateUnit = (n) => {
		return typeof n === "number" && !isNaN(n);
	};

	convertToDimensions = (layouts) => {
		const output = {};
		forOwn(layouts, (layout, breakpoint) => {
			forEach(layout, (o) => {
				if (!isArray(output[o.i])) {
					output[o.i] = [];
				}

				const dimension = assign({}, omit(o, ['i']), {breakpoint});

				output[o.i].push(dimension);
			});
		});
		return output;
	};

	handleLayoutChange = (current, all) => {
		const {onDimensionChange} = this.props;
		if (typeof onDimensionChange === "function") {
			const dimensions = this.convertToDimensions(all);
			return onDimensionChange(dimensions);
		}
	};

	render() {
		const {
			children, rowHeight, cols, breakpoints,
			dimensions, isDraggable, isResizable
		} = this.props;

		const layouts = this.convertToLayouts(dimensions);

		return (
			<ResponsiveLayout
				rowHeight={rowHeight}
				// margin={[10, 10]}
				isDraggable={isDraggable}
				isResizable={isResizable}
				// compactType="horizontal"
				onLayoutChange={this.handleLayoutChange}
				cols={cols}
				measureBeforeMount={true}
				children={children}
				breakpoints={breakpoints}
				layouts={layouts}/>
		);
	}
}

WidgetGridLayout.defaultProps = {
	rowHeight   : 100,
	cols        : {
		xs : 1,
		sm : 2,
		md : 3,
		lg : 3,
		xl : 4
	},
	breakpoints : {
		xs : 0,
		sm : 576,
		md : 768,
		lg : 992,
		xl : 1200
	}
};

export default WidgetGridLayout;