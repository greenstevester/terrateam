open Terrat_work_manifest3

let test_step_to_action_type () =
  let test_cases = [
    (Step.Apply, "apply");
    (Step.Build_config, "config_builder");
    (Step.Build_tree, "tree_builder");
    (Step.Index, "index");
    (Step.Plan, "plan");
    (Step.Unsafe_apply, "apply");
  ] in
  List.iter (fun (step, expected) ->
    let actual = Step.to_action_type step in
    if String.equal actual expected then
      Printf.printf "✓ %s -> %s\n" (Step.to_string step) actual
    else
      Printf.eprintf "✗ %s -> expected %s, got %s\n" (Step.to_string step) expected actual
  ) test_cases

let () = test_step_to_action_type ()