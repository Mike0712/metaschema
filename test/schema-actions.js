'use strict';

const metatests = require('metatests');

const metaschema = require('..');
const { getSchemaDir } = require('./utils');

metatests.test('must load Actions', test => {

  const testMethod = (test, method, ctx, expected) => {
    method({}, ctx, {}, (err, actual) => {
      test.error(err);
      test.strictSame(actual, expected);
      test.end();
    });
  };

  const testExecute = (test, def, ctx, expected) => {
    testMethod(test, def.Execute, ctx, expected);
  };

  metaschema.fs.loadAndCreate(getSchemaDir('actions'), null, (error, ms) => {
    test.error(error);

    test.strictSame(ms.actions.get('SchemaWithoutActions').size, 0);
    test.strictSame(ms.actions.get('SchemaWithActions').size, 1);

    test.endAfterSubtests();

    test.test('SchemaWithActions test', test => {
      const action = ms.actions
        .get('SchemaWithActions')
        .get('Act');
      test.endAfterSubtests();
      testExecute(test.test(), action.definition, { Id: 42 }, 'Resource42');
    });

    test.test('CustomActions test', test => {
      const action = ms.actions
        .get('CustomActions')
        .get('Act');
      test.strictSame(
        action.form,
        ms.forms.get('CustomActions.CustomForm')
      );
      test.endAfterSubtests();
      testExecute(test.test(), action.definition, { Id: 13 }, 'Resource13');
    });

    test.test('ActionsExecute test', test => {
      test.endAfterSubtests();

      const actAction = ms.actions
        .get('ActionsExecute')
        .get('Act');
      test.assertNot(actAction.form);
      testExecute(
        test.test(), actAction.definition, { Id: 42 }, { Action: 'M1' }
      );
      testExecute(
        test.test(), actAction.definition, { Id: 1 }, { Action: 'M2' }
      );

      const m1Action = ms.actions
        .get('ActionsExecute')
        .get('M1');
      test.strictSame(
        m1Action.form,
        ms.forms.get('ActionsExecute.M1')
      );
      testExecute(test.test(), m1Action.definition, { Id: 42 }, 'M1Resource42');

      const m2Action = ms.actions
        .get('ActionsExecute')
        .get('M2');
      test.strictSame(
        m2Action.form,
        ms.forms.get('ActionsExecute.CustomForm')
      );
      testExecute(test.test(), m2Action.definition, { Id: 42 }, 'M2Resource42');
    });

    test.test('ActionsExecuteForm test', test => {
      test.endAfterSubtests();

      const actAction = ms.actions
        .get('ActionsExecuteForm')
        .get('Act');
      test.assertNot(actAction.form);
      const { Execute: execute } = actAction.definition;

      const t1 = test.test();
      execute({}, { Id: 42 }, {}, (err, act) => {
        t1.error(err);
        t1.type(act, 'Execute');
        t1.strictSame(act.Action, 'M1');
        t1.strictSame(act.Form, 'CustomForm');
        t1.end();
      });

      const t2 = test.test();
      execute({}, { Id: 13 }, {}, (err, act) => {
        t2.error(err);
        t2.type(act, 'Execute');
        t2.strictSame(act.Action, 'M2');
        t2.strictSame(act.Form, 'CustomForm');
        t2.end();
      });
    });
  });
});
