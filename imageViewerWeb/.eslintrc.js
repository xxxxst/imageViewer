module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: [
		// 'plugin:vue/vue3-essential',
		'plugin:vue/essential',
		"eslint:recommended",
		"@vue/typescript/recommended",
		"@vue/prettier",
		"@vue/prettier/@typescript-eslint",
	],
	parserOptions: {
		ecmaVersion: 2020,
	},
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		"linebreak-style": [2, "windows"],
		"indent": [2, "tab", { "SwitchCase": 1 }],
		"comma-dangle": 0,
		"no-tabs": 0,
		"object-curly-newline": 0,
		"max-len": 0,
		"no-multiple-empty-lines": 0,
		"dot-notation": 0,
		"quotes": 0,
		"eol-last": 0,
		"no-unused-vars": 0,
		"max-classes-per-file": 0,
		"no-var": 0,
		"@typescript-eslint/no-explicit-any": 0,
		"@typescript-eslint/no-inferrable-types": 0,
		"lines-between-class-members": 0,
		"new-parens": 0,
		"vars-on-top": 0,
		"class-methods-use-this": 0,
		"@typescript-eslint/no-empty-function": 0,
		"no-trailing-spaces": 0,
		"eqeqeq": 0,
		"arrow-parens": 0,
		"no-plusplus": 0,
		"spaced-comment": 0,
		"no-continue": 0,
		"@typescript-eslint/no-unused-vars": 0,
		"guard-for-in": 0,
		"no-restricted-syntax": 0,
		"semi": 0,
		"no-param-reassign": 0,
		"padded-blocks": 0,
		"no-empty": 0,
		"arrow-spacing": 0,
		"no-restricted-properties": 0,
		"operator-assignment": 0,
		"no-mixed-operators": 0,
		"prefer-rest-params": 0,
		"block-scoped-var": 0,
		"no-else-return": 0,
		"no-bitwise": 0,
		"radix": 0,
		"one-var": 0,
		"no-multi-assign": 0,
		"prefer-arrow-callback": 0,
		"func-names": 0,
		"space-before-blocks": 0,
		"one-var-declaration-per-line": 0,
		"object-shorthand": 0,
		"prefer-template": 0,
		"no-unused-expressions": 0,
		"import/prefer-default-export": 0,
		"space-before-function-paren": 0,
		"import/newline-after-import": 0,
		"prefer-const": 0,
		"no-shadow": 0,
		"no-return-await": 0,
		"quote-props": 0,
		"prefer-destructuring": 0,
		"no-constant-condition": 0,
		"@typescript-eslint/no-this-alias": 0,
		"no-restricted-globals": 0,
		"no-console": 0,
		"comma-spacing": 0,
		"object-property-newline": 0,
		"no-underscore-dangle": 0,
		"arrow-body-style": 0,
		"no-undef": 0,
		"no-control-regex": 0,
		"import/extensions": 0,
		"import/no-unresolved": 0,
		"array-callback-return": 0,
		"@typescript-eslint/no-use-before-define": 0,
		"consistent-return": 0,
		"import/no-cycle": 0,
		"default-case": 0,
		"wrap-iife": [2, "inside"],
		"no-await-in-loop": 0,
		"@typescript-eslint/member-delimiter-style": 0,
		"new-cap": 0,
		"prefer-spread": 0,
		"import/no-named-as-default-member": 0,
		"no-useless-constructor": 0,
		"space-in-parens": 0,
		"no-lonely-if": 0,
		"no-new": 0,
		"no-alert": 0,
		"@typescript-eslint/interface-name-prefix": 0,
		"no-undef-init": 0,
		"@typescript-eslint/ban-ts-ignore": 0,
		"consistent-return": 0,
		"no-lonely-if": 0,
		"no-useless-return": 0,
		"default-case": 0,
		"no-loop-func": 0,
		"no-return-assign": 0,
		// "vue/require-v-for-key": 0,
		"global-require": 0,
		"@typescript-eslint/no-var-requires": 0,
		"vue/no-unused-vars": 0,
		"prettier/prettier": 0,
		"@typescript-eslint/explicit-module-boundary-types": 0,
		"@typescript-eslint/ban-types": 0,
		"@typescript-eslint/ban-ts-comment": 0,
		"no-useless-concat": 0,
		"import/no-mutable-exports": 0,
		"no-eval": 0,
		"no-nested-ternary": 0,
		"import/no-duplicates": 0,
		"camelcase": 0,
		"no-use-before-define": 0,
	},
};